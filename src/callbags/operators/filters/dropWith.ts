import type { AnyPull, MultiSource } from '../../sources/core'

export function dropWith<Value, Context, Err, P extends AnyPull>(
	eq: (next: Value, last: Value) => unknown = Object.is,
) {
	return function (
		source: MultiSource<Value, Context, Err, P>,
	): MultiSource<Value, Context, Err, P> {
		return function ({ complete, context, error, next }) {
			let first = true
			let last: Value
			const props = source({
				complete,
				context,
				error,
				next(value) {
					if (first || !eq(value, last!)) next(value)
					first = false
					last = value
				},
			})
			return props
		}
	}
}
