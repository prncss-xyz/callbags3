import { noop } from '@constellar/core'
import type { Pull, MultiSource } from './core'

export function empty<Value, Index>(): MultiSource<Value, Index, never, Pull> {
	return function ({ complete }) {
		return {
			pull() {
				complete()
			},
			unmount: noop,
		}
	}
}

export function once<Value>(
	value: Value,
): MultiSource<Value, void, never, Pull> {
	return function ({ next, complete }) {
		let closed = false
		return {
			pull() {
				next(value)
				if (closed) return
				complete()
			},
			unmount() {
				closed = true
			},
		}
	}
}

export function iterable<Value>(
	values: Iterable<Value>,
): MultiSource<Value, number, never, Pull> {
	return function ({ next, complete }) {
		let closed = false
		return {
			pull() {
				let index = 0
				for (const value of values) {
					next(value, index++)
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
