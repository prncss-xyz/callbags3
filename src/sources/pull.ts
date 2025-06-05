import { noop } from '@constellar/core'
import type { Observable, Pull } from './core'

export function empty<Value, Index>(): Observable<Value, Index, never, Pull> {
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
): Observable<Value, void, never, Pull> {
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
): Observable<Value, number, never, Pull> {
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
