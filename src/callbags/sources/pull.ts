import { noop } from '@constellar/core'

import type { MultiSource, Pull, SingleSource } from './core'

export function empty<Value, Context = void>(): MultiSource<
	Value,
	Context,
	never,
	Pull
> {
	return function ({ complete, context }) {
		return {
			context,
			pull: complete,
			unmount: noop,
		}
	}
}

export function once<Value, Context = void>(
	value: Value,
): SingleSource<Value, Context, never, Pull> {
	return function ({ context, next }) {
		return {
			context,
			pull() {
				next(value)
			},
			unmount: noop,
		}
	}
}

export function iterable<Value, Context = void>(
	values: Iterable<Value>,
): MultiSource<Value, Context, never, Pull> {
	return function ({ complete, context, next }) {
		let closed = false
		return {
			context,
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
