import { fromInit, type Init } from '@prncss-xyz/utils'
import type { MultiSource, SingleSource } from './core'

export function onceAsync<Value, Index = void>(
	init: Init<Promise<Value>>,
	index?: Index,
): SingleSource<Value, Index, never, undefined> {
	return function ({ next }) {
		let closed = false
		fromInit(init).then((value) => {
			if (closed) return
			next(value, index!)
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
): MultiSource<Value, number, never, undefined> {
	return function ({ complete, next }) {
		let index = 0
		let closed = false
		;(async () => {
			for await (const value of values) {
				if (closed) return
				next(value, index++)
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
): MultiSource<number, number, never, undefined> {
	return function ({ next }) {
		let index = 0
		let handler = setInterval(() => {
			next(index, index)
			index++
		}, period)
		return {
			pull: undefined,
			unmount() {
				clearInterval(handler)
			},
		}
	}
}
