import type { AnyPull, MultiSource } from '../../sources/core'

export function takeUntil<Value, Context, Err, P extends AnyPull>(
	cond: (value: Value, context: Context) => unknown,
) {
	return function (
		source: MultiSource<Value, Context, Err, P>,
	): MultiSource<Value, Context, Err, P> {
		return function ({ context, next, complete, error }) {
			const props = source({
				context,
				next(value) {
					next(value)
					if (cond(value, context)) complete()
				},
				complete,
				error,
			})
			return props
		}
	}
}
