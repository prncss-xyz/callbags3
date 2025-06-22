import type { AnyPull, MultiSource, SingleSource } from '../sources/core'

export function toMulti<Value, Context, Err, P extends AnyPull>(
	source: SingleSource<Value, Context, Err, P>,
): MultiSource<Value, Context, Err, P> {
	return function ({ context, complete, next, error }) {
		return source({
			context,
			complete: undefined,
			next(v) {
				next(v)
				complete()
			},
			error,
		})
	}
}
