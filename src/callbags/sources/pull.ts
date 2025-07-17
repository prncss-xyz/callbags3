import { noop } from '@constellar/core'

import type { MultiSource, Pull, SingleSource } from './core'

export function empty<Value>(): MultiSource<Value, never, Pull> {
	return function ({ complete }) {
		return {
			pull: complete,
			unmount: noop,
		}
	}
}

export function once<Value>(value: Value): SingleSource<Value, never, Pull> {
	return function ({ next }) {
		return {
			pull() {
				next(value)
			},
			unmount: noop,
		}
	}
}

export function iterable<Value>(
	values: Iterable<Value>,
): MultiSource<Value, never, Pull> {
	return function ({ complete, next }) {
		let closed = false
		return {
			pull() {
				for (const value of values) {
					next(value)
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
