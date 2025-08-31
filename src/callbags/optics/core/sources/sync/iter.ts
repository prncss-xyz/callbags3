import type { Source } from '../../core/types'

export function iter<Value>(values: Iterable<Value>): Source<Value, never> {
	return function (next, _err, complete) {
		let closed = false
		return {
			start() {
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
