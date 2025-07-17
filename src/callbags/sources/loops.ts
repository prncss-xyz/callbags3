import { add, fromInit, gt, type Init, lt } from '@prncss-xyz/utils'

import type { MultiSource, Pull } from './core'

import { just, type Maybe } from '../../errors'

export function unfold<Value>(
	init: Init<Value>,
	cb: (acc: Value) => Maybe<Value>,
): MultiSource<Value, never, Pull> {
	return function ({ complete, next }) {
		let closed = false
		return {
			pull() {
				let res = cb(fromInit(init))
				while (just.is(res)) {
					next(just.get(res))
					if (closed) return
					res = cb(just.get(res))
				}
				complete()
			},
			unmount() {
				closed = true
			},
		}
	}
}

export function loop<Value>(
	cond: (value: Value) => unknown,
	step: (value: Value) => Value,
	init: Init<Value, []>,
): MultiSource<Value, never, Pull> {
	return function ({ complete, next }) {
		let closed = false
		return {
			pull() {
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

export function until<Value>(
	cond: (value: Value) => unknown,
	step: (value: Value) => Value,
	init: Init<Value, []>,
): MultiSource<Value, never, Pull> {
	return function ({ complete, next }) {
		let closed = false
		return {
			pull() {
				let acc = init
				while (true) {
					acc = step(fromInit(acc))
					next(acc)
					if (closed) return
					if (cond(acc)) break
				}
				complete()
			},
			unmount() {
				closed = true
			},
		}
	}
}
