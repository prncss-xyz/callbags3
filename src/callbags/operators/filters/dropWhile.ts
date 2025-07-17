import type { AnyPull, MultiSource } from '../../sources/core'

export function dropWhile<Value, Err, P extends AnyPull>(
	cond: (value: Value) => unknown,
) {
	return function (
		source: MultiSource<Value, Err, P>,
	): MultiSource<Value, Err, P> {
		return function ({ complete, error, next }) {
			let closed: unknown = true
			const props = source({
				complete,
				error,
				next(value) {
					if (!closed) next(value)
					closed = closed && cond(value)
				},
			})
			return props
		}
	}
}
