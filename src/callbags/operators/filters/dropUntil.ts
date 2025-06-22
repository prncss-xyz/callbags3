import type { AnyPull, MultiSource } from '../../sources/core'

export function dropUntil<Value, Context, Err, P extends AnyPull>(
	cond: (value: Value, context: Context) => unknown,
) {
	return function (
		source: MultiSource<Value, Context, Err, P>,
	): MultiSource<Value, Context, Err, P> {
		return function ({ next, complete, context, error }) {
			let fulfilled: unknown = false
			const props = source({
				context,
				next(value) {
					if (fulfilled) next(value)
					fulfilled = fulfilled || cond(value, context)
				},
				complete,
				error,
			})
			return props
		}
	}
}
