import type { AnyPull, MultiSource } from '../../sources/core'

export function takeUntil<Value, Context, Err, P extends AnyPull>(
	cond: (value: Value, context: Context) => unknown,
) {
	return function (
		source: MultiSource<Value, Context, Err, P>,
	): MultiSource<Value, Context, Err, P> {
		return function ({ complete, context, error, next }) {
			const props = source({
				complete,
				context,
				error,
				next(value) {
					next(value)
					if (cond(value, context)) complete()
				},
			})
			return props
		}
	}
}
