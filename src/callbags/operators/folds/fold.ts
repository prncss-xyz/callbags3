import { fromInit, type Init, isoAssert } from '@prncss-xyz/utils'

import type { AnyPull, MultiSource, SingleSource } from '../../sources/core'

import { singleton } from '../../../tags'

export const empty = singleton('empty')
const emptyError = empty.void()
type EmptyError = typeof emptyError

export type Fold<Value, Acc, Context, R = Acc> =
	| {
			fold: (value: Value, acc: Acc, context: Context) => Acc
			init: Init<Acc>
			result?: (acc: Acc) => R
	  }
	| {
			foldDest: (value: Value, acc: Acc, context: Context) => Acc
			init: Init<Acc>
			result?: (acc: Acc) => R
	  }

export type Fold1<Acc, Context, R = Acc> =
	| {
			fold: (value: Acc, acc: Acc, context: Context) => Acc
			result?: (acc: Acc) => R
	  }
	| {
			foldDest: (value: Acc, acc: Acc, context: Context) => Acc
			result?: (acc: Acc) => R
	  }

export function fold<
	Value,
	Context,
	Err,
	P extends AnyPull,
	Acc,
	S,
	Succ = Acc,
>(
	props: Fold<Value, Acc, Context, Succ>,
): (
	source: MultiSource<Value, Context, Err, P>,
) => SingleSource<Succ, Context, Err, P>
export function fold<Value, Context, Err, P extends AnyPull, S, Succ = Value>(
	props: Fold1<Value, Context, Succ>,
): (
	source: MultiSource<Value, Context, Err, any>,
) => SingleSource<Value, any, EmptyError | Err, any>
export function fold<Value, Context, Err, P extends AnyPull, Acc, Succ>(props: {
	fold?: (value: Value, acc: Acc, context: Context) => Acc
	foldDest?: (value: Value, acc: Acc, context: Context) => Acc
	init?: Init<Acc>
	result?: (acc: Acc) => Succ
}) {
	return function (
		source: MultiSource<Value, Context, Err, P>,
	): SingleSource<Value, Context, EmptyError | Err, P> {
		const foldFn = props.foldDest ?? props.fold
		isoAssert(foldFn)
		return function ({ context, error, next }) {
			let dirty = false
			let acc: Acc
			if ('init' in props) {
				dirty = true
				acc = fromInit(props.init)!
			}
			return {
				...source({
					complete() {
						if (dirty) {
							next(props.result ? props.result(acc) : (acc as any))
						} else error(emptyError)
					},
					context,
					error,
					next(value) {
						if (dirty) {
							acc = foldFn(value, acc, context)
						} else {
							acc = value as any
							dirty = true
						}
					},
				}),
			}
		}
	}
}
