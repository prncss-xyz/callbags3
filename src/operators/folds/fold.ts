import { EmptyError, emptyErrorValue, type DomainError } from '../../errors'
import type { AnyPull, MultiSource, SingleSource } from '../../sources/core'
import { fromInit, isoAssert, type Init } from '@prncss-xyz/utils'

export type Fold<Value, Acc, Index, R = Acc> =
	| {
			fold: (value: Value, acc: Acc, index: Index) => Acc
			init: Init<Acc>
			result?: (acc: Acc) => R
	  }
	| {
			foldDest: (value: Value, acc: Acc, index: Index) => Acc
			init: Init<Acc>
			result?: (acc: Acc) => R
	  }

export type Fold1<Acc, Index, R = Acc> =
	| {
			fold: (value: Acc, acc: Acc, index: Index) => Acc
			result?: (acc: Acc) => R
	  }
	| {
			foldDest: (value: Acc, acc: Acc, index: Index) => Acc
			result?: (acc: Acc) => R
	  }

export function fold<
	Value,
	Index,
	Err extends DomainError,
	P extends AnyPull,
	Acc,
	S,
	Succ = Acc,
>(
	props: Fold<Value, Acc, Index, Succ>,
): (sink: MultiSource<Value, Index, Err, P>) => SingleSource<Succ, Err, P>
export function fold<
	Value,
	Index,
	Err extends DomainError,
	P extends AnyPull,
	S,
	Succ = Value,
>(
	props: Fold1<Value, Index, Succ>,
): (
	source: MultiSource<Value, Index, Err, P>,
) => SingleSource<Value, Err | EmptyError, P>
export function fold<
	Value,
	Index,
	Err extends DomainError,
	P extends AnyPull,
	Acc,
	Succ,
>(props: {
	fold?: (value: Value, acc: Acc, index: Index) => Acc
	foldDest?: (value: Value, acc: Acc, index: Index) => Acc
	init?: Init<Acc>
	result?: (acc: Acc) => Succ
}) {
	return function (
		source: MultiSource<Value, Index, Err, P>,
	): SingleSource<Value, Err | EmptyError, P> {
		const foldFn = props.foldDest ?? props.fold
		isoAssert(foldFn)
		return function ({ next, error }) {
			let dirty = false
			let acc: Acc
			if ('init' in props) {
				dirty = true
				acc = fromInit(props.init)!
			}
			return {
				...source({
					error,
					next(value, index) {
						if (dirty) {
							acc = foldFn(value, acc, index)
						} else {
							acc = value as any
							dirty = true
						}
					},
					complete() {
						if (dirty) {
							next(props.result ? props.result(acc) : (acc as any))
						} else error(emptyErrorValue)
					},
				}),
			}
		}
	}
}
