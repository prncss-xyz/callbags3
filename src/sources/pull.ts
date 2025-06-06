import { noop } from '@constellar/core'
import type { Source, Pull } from './core'

export function empty<Value, Index>(): Source<Value, Index, never, Pull> {
	return function ({ complete }) {
		return {
			pull() {
				complete()
			},
			unmount: noop,
		}
	}
}

export function once<Value>(value: Value): Source<Value, void, never, Pull> {
	return function ({ next, complete }) {
		return {
			pull() {
				next(value)
				complete()
			},
			unmount: noop,
		}
	}
}

export function iterable<Value>(
	values: Iterable<Value>,
): Source<Value, number, never, Pull> {
	return function ({ next, complete }) {
		let closed = false
		return {
			pull() {
				let index = 0
				for (const value of values) {
					next(value, index++)
					if (closed) break
				}
				complete()
			},
			unmount() {
				closed = true
			},
		}
	}
}
