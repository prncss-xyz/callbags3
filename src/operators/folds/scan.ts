import type { AnyPull, MultiSource } from '../../sources/core'
import { fromInit, type Init } from '@prncss-xyz/utils'

type Scan<Value, Acc, Index, R = Acc> = {
	fold: (value: Value, acc: Acc, index: Index) => Acc
	init: Init<Acc>
	result?: (acc: Acc) => R
}
type Scan1<Acc, Index, R = Acc> = {
	fold: (value: Acc, acc: Acc, index: Index) => Acc
	result?: (acc: Acc) => R
}

export function scan<Value, Index, Err, P extends AnyPull, Acc, S, Succ = Acc>(
	props: Scan<Value, Acc, Index, Succ>,
): (
	source: MultiSource<Value, Index, Err, P>,
) => MultiSource<Value, Index, Err, P>
export function scan<Value, Index, Err, P extends AnyPull, S, Succ = Value>(
	props: Scan1<Value, Index, Succ>,
): (
	source: MultiSource<Value, Index, Err, P>,
) => MultiSource<Value, Index, Err, P>
export function scan<Value, Index, Err, Succ, P extends AnyPull, Acc>(props: {
	fold: (value: Value, acc: Acc, index: Index) => Acc
	init?: Init<Acc>
	result?: (acc: Acc) => Succ
}) {
	return function (
		source: MultiSource<Value, Index, Err, P>,
	): MultiSource<Value, Index, Err, P> {
		const foldFn = props.fold
		return function ({ error, next, complete }) {
			let dirty = false
			let acc: Acc
			if ('init' in props) {
				dirty = true
				acc = fromInit(props.init)!
			}
			return source({
				complete,
				error,
				next(value, index) {
					if (dirty) {
						acc = foldFn(value, acc, index)
					} else {
						acc = value as any
						dirty = true
					}
					if (props.result) next(props.result(acc) as any, index)
					else next(acc as any, index)
				},
			})
		}
	}
}
