import type { MultiSource, Pull } from './core'
import { just, type Maybe } from '../errables/maybe'
import { add, fromInit, gt, lt, type Init } from '@prncss-xyz/utils'

export function unfold<Value>(
	init: Init<Value>,
	cb: (acc: Value, index: number) => Maybe<Value>,
): MultiSource<Value, number, never, Pull> {
	return function ({ next, complete }) {
		let closed = false
		return {
			pull() {
				let index = 0
				let res = cb(fromInit(init), index)
				while (just.is(res)) {
					next(just.get(res), index)
					if (closed) return
					res = cb(just.get(res), ++index)
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
	cond: (value: Value, index: number) => unknown,
	step: (value: Value, index: number) => Value,
	init: Init<Value>,
): MultiSource<Value, number, never, Pull> {
	return function ({ next, complete }) {
		let closed = false
		return {
			pull() {
				let index = 0
				for (
					let acc = fromInit(init);
					cond(acc, index);
					acc = step(acc, index)
				) {
					next(acc, index++)
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
	return loop(step > 0 ? lt(end) : gt(end), add(step), start)
}

export function times(n: number) {
	return range(0, n)
}

export function until<Value>(
	cond: (value: Value, index: number) => unknown,
	step: (value: Value, index: number) => Value,
	init: Init<Value>,
): MultiSource<Value, number, never, Pull> {
	return function ({ next, complete }) {
		closed = false
		return {
			pull() {
				let index = 0
				let acc = init
				while (true) {
					acc = step(fromInit(acc), index++)
					next(acc, index)
					if (closed) return
					if (cond(acc, index)) break
				}
				complete()
			},
			unmount() {
				closed = true
			},
		}
	}
}
