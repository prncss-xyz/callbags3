import { EmptyError, emptyErrorValue, type DomainError } from '../errors'
import type { AnyPull, Source, Sink } from '../sources/core'
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
): (sink: Source<Value, Index, Err, P>) => Sink<Succ, Err, P>
export function fold<
	Value,
	Index,
	Err extends DomainError,
	P extends AnyPull,
	S,
	Succ = Value,
>(
	props: Fold1<Value, Index, Succ>,
): (source: Source<Value, Index, Err, P>) => Sink<Value, Err | EmptyError, P>
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
		source: Source<Value, Index, Err, P>,
	): Sink<Value, Err | EmptyError, P> {
		const foldFn = props.foldDest ?? props.fold
		isoAssert(foldFn)
		return function ({ success, error }) {
			let dirty = false
			let acc: Acc
			if (props.init) {
				dirty = true
				acc = fromInit(props.init)
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
							success(props.result ? props.result(acc) : (acc as any))
						} else error(emptyErrorValue)
					},
				}),
			}
		}
	}
}
