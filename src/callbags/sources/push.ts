import { fromInit, type Init } from '@prncss-xyz/utils'

import type { MultiSource, SingleSource } from './core'

export function onceAsync<Value>(
	init: Init<Promise<Value>>,
): SingleSource<Value, never, undefined> {
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

export function asyncIterable<Value>(
	values: AsyncIterable<Value>,
): MultiSource<Value, never, undefined> {
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

export function interval(
	period: number,
): MultiSource<number, never, undefined> {
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
