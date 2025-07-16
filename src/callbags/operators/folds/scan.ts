import { fromInit, type Init } from '@prncss-xyz/utils'

import type { AnyPull, MultiSource } from '../../sources/core'

import { deferCond } from '../../../utils'

type Scan<Value, Acc, Context, R = Acc> = {
	fold: (value: Value, acc: Acc, context: Context) => Acc
	init: Init<Acc>
	result?: (acc: Acc) => R
}
type Scan1<Acc, Context, R = Acc> = {
	fold: (value: Acc, acc: Acc, context: Context) => Acc
	result?: (acc: Acc) => R
}

export function scan<Value, Index, Err, P extends AnyPull, Acc, Succ = Acc>(
	props: Scan<Value, Acc, Index, Succ>,
): (
	source: MultiSource<Value, Index, Err, P>,
) => MultiSource<Value, Index, Err, P>
export function scan<Value, Index, Err, P extends AnyPull, Succ = Value>(
	props: Scan1<Value, Index, Succ>,
): (
	source: MultiSource<Value, Index, Err, P>,
) => MultiSource<Value, Index, Err, P>
export function scan<Value, Context, Err, Succ, P extends AnyPull, Acc>(props: {
	fold: (value: Value, acc: Acc, context: Context) => Acc
	init?: Init<Acc>
	result?: (acc: Acc) => Succ
}) {
	return function (
		source: MultiSource<Value, Context, Err, P>,
	): MultiSource<Value, Context, Err, P> {
		const foldFn = props.fold
		return function ({ complete, context, error, next }) {
			let dirty = false
			let acc: Acc
			const res = source({
				complete,
				context,
				error,
				next(value) {
					if (dirty) {
						acc = foldFn(value, acc, context)
					} else {
						acc = value as any
						dirty = true
					}
					if (props.result) next(props.result(acc) as any)
					else next(acc as any)
				},
			})
			if ('init' in props) {
				dirty = true
				acc = fromInit(props.init)!
				deferCond(res.pull, () => {
					if (props.result) next(props.result(acc) as any)
					else next(acc as any)
				})
			}
			return res
		}
	}
}
