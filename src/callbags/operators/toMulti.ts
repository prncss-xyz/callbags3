import type { AnyPull, MultiSource, SingleSource } from '../sources/core'

export function toMulti<Value, Context, Err, P extends AnyPull>(
	source: SingleSource<Value, Context, Err, P>,
): MultiSource<Value, Context, Err, P> {
	return function ({ complete, context, error, next }) {
		return source({
			complete: undefined,
			context,
			error,
			next(v) {
				next(v)
				complete()
			},
		})
	}
}
