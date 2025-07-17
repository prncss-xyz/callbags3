import type { AnyPull, MultiSource, SingleSource } from '../sources/core'

export function toMulti<Value, Err, P extends AnyPull>(
	source: SingleSource<Value, Err, P>,
): MultiSource<Value, Err, P> {
	return function ({ complete, error, next }) {
		return source({
			complete: undefined,
			error,
			next(v) {
				next(v)
				complete()
			},
		})
	}
}
