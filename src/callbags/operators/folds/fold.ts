import type { AnyPull, MultiSource, SingleSource } from '../../sources/core'
import { fromInit, isoAssert, type Init } from '@prncss-xyz/utils'
import { singleton } from '../../../tags'

export const empty = singleton('empty')
const emptyError = empty.void()
type EmptyError = typeof emptyError

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

export function fold<Value, Index, Err, P extends AnyPull, Acc, S, Succ = Acc>(
	props: Fold<Value, Acc, Index, Succ>,
): (
	source: MultiSource<Value, Index, Err, P>,
) => SingleSource<Succ, void, Err, P>
export function fold<Value, Index, Err, P extends AnyPull, S, Succ = Value>(
	props: Fold1<Value, Index, Succ>,
): (
	source: MultiSource<Value, Index, Err, any>,
) => SingleSource<Value, any, Err | EmptyError, any>
export function fold<Value, Index, Err, P extends AnyPull, Acc, Succ>(props: {
	fold?: (value: Value, acc: Acc, index: Index) => Acc
	foldDest?: (value: Value, acc: Acc, index: Index) => Acc
	init?: Init<Acc>
	result?: (acc: Acc) => Succ
}) {
	return function (
		source: MultiSource<Value, Index, Err, P>,
	): SingleSource<Value, void, Err | EmptyError, P> {
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
						} else error(emptyError)
					},
				}),
			}
		}
	}
}
