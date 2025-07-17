import { fromInit, type Init } from '@prncss-xyz/utils'

import type { AnyPull, MultiSource } from '../../sources/core'

import { deferCond } from '../../../utils'

type Scan<Value, Acc, R = Acc> = {
	fold: (value: Value, acc: Acc) => Acc
	init: Init<Acc>
	result?: (acc: Acc) => R
}
type Scan1<Acc, R = Acc> = {
	fold: (value: Acc, acc: Acc) => Acc
	result?: (acc: Acc) => R
}

export function scan<Value, Err, P extends AnyPull, Acc, Succ = Acc>(
	props: Scan<Value, Acc, Succ>,
): (source: MultiSource<Value, Err, P>) => MultiSource<Value, Err, P>
export function scan<Value, Err, P extends AnyPull, Succ = Value>(
	props: Scan1<Value, Succ>,
): (source: MultiSource<Value, Err, P>) => MultiSource<Value, Err, P>
export function scan<Value, Err, Succ, P extends AnyPull, Acc>(props: {
	fold: (value: Value, acc: Acc) => Acc
	init?: Init<Acc>
	result?: (acc: Acc) => Succ
}) {
	return function (
		source: MultiSource<Value, Err, P>,
	): MultiSource<Value, Err, P> {
		const foldFn = props.fold
		return function ({ complete, error, next }) {
			let dirty = false
			let acc: Acc
			const res = source({
				complete,
				error,
				next(value) {
					if (dirty) {
						acc = foldFn(value, acc)
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
