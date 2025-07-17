import { fromInit, type Init, isoAssert } from '@prncss-xyz/utils'

import type { AnyPull, MultiSource, SingleSource } from '../../sources/core'

import { emptyError, type EmptyError } from '../../../errors/empty'

export type Fold<Value, Acc = Value, R = Acc> =
	| {
			fold: (value: Value, acc: Acc) => Acc
			init: Init<Acc>
			result?: (acc: Acc) => R
	  }
	| {
			foldDest: (value: Value, acc: Acc) => Acc
			init: Init<Acc>
			result?: (acc: Acc) => R
	  }

export type Fold1<Acc, R = Acc> =
	| {
			fold: (value: Acc, acc: Acc) => Acc
			result?: (acc: Acc) => R
	  }
	| {
			foldDest: (value: Acc, acc: Acc) => Acc
			result?: (acc: Acc) => R
	  }

export function fold<Value, Err, P extends AnyPull, Acc, Succ = Acc>(
	props: Fold<Value, Acc, Succ>,
): (source: MultiSource<Value, Err, P>) => SingleSource<Succ, Err, P>
export function fold<Value, Err, P extends AnyPull, Succ = Value>(
	props: Fold1<Value, Succ>,
): (
	source: MultiSource<Value, Err, P>,
) => SingleSource<Value, EmptyError | Err, P>
export function fold<Value, Err, P extends AnyPull, Acc, Succ>(props: {
	fold?: (value: Value, acc: Acc) => Acc
	foldDest?: (value: Value, acc: Acc) => Acc
	init?: Init<Acc>
	result?: (acc: Acc) => Succ
}) {
	return function (
		source: MultiSource<Value, Err, P>,
	): SingleSource<Value, EmptyError | Err, P> {
		const foldFn = props.foldDest ?? props.fold
		isoAssert(foldFn)
		return function ({ error, next }) {
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
					error,
					next(value) {
						if (dirty) {
							acc = foldFn(value, acc)
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
