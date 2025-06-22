import type { AnyPull, MultiSource } from '../../sources/core'

export function takeWhile<Value, Context, Err, P extends AnyPull>(
	cond: (value: Value, context: Context) => unknown,
) {
	return function (
		source: MultiSource<Value, Context, Err, P>,
	): MultiSource<Value, Context, Err, P> {
		return function ({ context, next, complete, error }) {
			const props = source({
				context,
				next(value) {
					if (cond(value, context)) next(value)
					else complete()
				},
				complete,
				error,
			})
			return props
		}
	}
}
