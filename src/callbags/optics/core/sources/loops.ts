import { add, fromInit, gt, type Init, lt } from '@prncss-xyz/utils'

import type { Source } from '../core/types'

export function loop<Value>(
	cond: (value: Value) => unknown,
	step: (value: Value) => Value,
	init: Init<Value, []>,
): Source<Value, never> {
	return function (next, _err, complete) {
		let closed = false
		return {
			start() {
				for (let acc = fromInit(init); cond(acc); acc = step(acc)) {
					next(acc)
					if (closed) return
				}
				complete()
			},
			unmount() {
				closed = true
			},
		}
	}
}

export function range(start: number, end: number, step = 1) {
	return loop<number>(step > 0 ? lt(end) : gt(end), add(step), start)
}

export function times(n: number) {
	return range(0, n)
}
