import type { AnyPull, MultiSource, SingleSource } from '../sources/core'

export function toMulti<Value, Index, Err, P extends AnyPull>(
	source: SingleSource<Value, Index, Err, P>,
): MultiSource<Value, Index, Err, P> {
	return function ({ complete, next, error }) {
		return source({
			complete: undefined,
			next(v, i) {
				next(v, i)
				complete()
			},
			error,
		})
	}
}
