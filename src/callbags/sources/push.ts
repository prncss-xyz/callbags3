import { fromInit, type Init } from '@prncss-xyz/utils'
import type { MultiSource, SingleSource } from './core'

export function onceAsync<Value, Context = void>(
	init: Init<Promise<Value>>,
): SingleSource<Value, Context, never, undefined> {
	return function ({ next }) {
		let closed = false
		fromInit(init).then((value) => {
			if (closed) return
			next(value)
		})
		return {
			pull: undefined,
			unmount() {
				closed = true
			},
		}
	}
}

export function asyncIterable<Value, Context = void>(
	values: AsyncIterable<Value>,
): MultiSource<Value, Context, never, undefined> {
	return function ({ complete, next }) {
		let closed = false
		;(async () => {
			for await (const value of values) {
				if (closed) return
				next(value)
			}
			complete()
		})()
		return {
			pull: undefined,
			unmount() {
				closed = true
			},
		}
	}
}

export function interval<Context = void>(
	period: number,
): MultiSource<number, Context, never, undefined> {
	return function ({ next }) {
		let index = 0
		let handler = setInterval(() => {
			next(index++)
		}, period)
		return {
			pull: undefined,
			unmount() {
				clearInterval(handler)
			},
		}
	}
}
