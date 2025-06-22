import type { AnyPull, MultiSource } from '../../sources/core'

export function dropWhile<Value, Context, Err, P extends AnyPull>(
	cond: (value: Value, context: Context) => unknown,
) {
	return function (
		source: MultiSource<Value, Context, Err, P>,
	): MultiSource<Value, Context, Err, P> {
		return function ({ next, context, complete, error }) {
			let closed: unknown = true
			const props = source({
				context,
				next(value) {
					if (!closed) next(value)
					closed = closed && cond(value, context)
				},
				complete,
				error,
			})
			return props
		}
	}
}
