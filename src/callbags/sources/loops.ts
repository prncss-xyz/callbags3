import { add, fromInit, gt, type Init, lt } from '@prncss-xyz/utils'

import type { MultiSource, Pull } from './core'

import { just, type Maybe } from '../../errors'

export function unfold<Value, Context = void>(
	init: Init<Value>,
	cb: (acc: Value, context: Context) => Maybe<Value>,
): MultiSource<Value, Context, never, Pull> {
	return function ({ complete, context, next }) {
		let closed = false
		return {
			pull() {
				let res = cb(fromInit(init), context)
				while (just.is(res)) {
					next(just.get(res))
					if (closed) return
					res = cb(just.get(res), context)
				}
				complete()
			},
			unmount() {
				closed = true
			},
		}
	}
}

export function loop<Value, Context = void>(
	cond: (value: Value, context: Context) => unknown,
	step: (value: Value, context: Context) => Value,
	init: Init<Value, [Context]>,
): MultiSource<Value, Context, never, Pull> {
	return function ({ complete, context, next }) {
		let closed = false
		return {
			pull() {
				for (
					let acc = fromInit(init, context);
					cond(acc, context);
					acc = step(acc, context)
				) {
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

export function range<Context = void>(start: number, end: number, step = 1) {
	return loop<number, Context>(step > 0 ? lt(end) : gt(end), add(step), start)
}

export function times<Context = void>(n: number) {
	return range<Context>(0, n)
}

export function until<Value, Context = void>(
	cond: (value: Value, context: Context) => unknown,
	step: (value: Value, context: Context) => Value,
	init: Init<Value, [Context]>,
): MultiSource<Value, Context, never, Pull> {
	return function ({ complete, context, next }) {
		let closed = false
		return {
			pull() {
				let acc = init
				while (true) {
					acc = step(fromInit(acc, context), context)
					next(acc)
					if (closed) return
					if (cond(acc, context)) break
				}
				complete()
			},
			unmount() {
				closed = true
			},
		}
	}
}
