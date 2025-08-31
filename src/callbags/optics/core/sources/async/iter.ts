import type { Source } from '../../core/types'

export function iterAsync<Value>(
	values: AsyncIterable<Value>,
): Source<Value, never> {
	return function (next, _err, complete) {
		let closed = false
		return {
			start() {
				;(async () => {
					for await (const value of values) {
						if (closed) return
						next(value)
					}
					complete()
				})()
			},
			unmount() {
				closed = true
			},
		}
	}
}
