import type { AnyPull, MultiSource } from '../../sources/core'

export function dropWhile<Value, Context, Err, P extends AnyPull>(
	cond: (value: Value, context: Context) => unknown,
) {
	return function (
		source: MultiSource<Value, Context, Err, P>,
	): MultiSource<Value, Context, Err, P> {
		return function ({ complete, context, error, next }) {
			let closed: unknown = true
			const props = source({
				complete,
				context,
				error,
				next(value) {
					if (!closed) next(value)
					closed = closed && cond(value, context)
				},
			})
			return props
		}
	}
}
