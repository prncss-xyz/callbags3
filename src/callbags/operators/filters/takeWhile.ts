import type { AnyPull, MultiSource } from '../../sources/core'

export function takeWhile<Value, Err, P extends AnyPull>(
	cond: (value: Value) => unknown,
) {
	return function (
		source: MultiSource<Value, Err, P>,
	): MultiSource<Value, Err, P> {
		return function ({ complete, error, next }) {
			const props = source({
				complete,
				error,
				next(value) {
					if (cond(value)) next(value)
					else complete()
				},
			})
			return props
		}
	}
}
