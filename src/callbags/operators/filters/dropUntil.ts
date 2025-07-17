import type { AnyPull, MultiSource } from '../../sources/core'

export function dropUntil<Value, Err, P extends AnyPull>(
	cond: (value: Value) => unknown,
) {
	return function (
		source: MultiSource<Value, Err, P>,
	): MultiSource<Value, Err, P> {
		return function ({ complete, error, next }) {
			let fulfilled: unknown = false
			const props = source({
				complete,
				error,
				next(value) {
					if (fulfilled) next(value)
					fulfilled = fulfilled || cond(value)
				},
			})
			return props
		}
	}
}
