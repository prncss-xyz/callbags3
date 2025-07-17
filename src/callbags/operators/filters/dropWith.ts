import type { AnyPull, MultiSource } from '../../sources/core'

export function dropWith<Value, Err, P extends AnyPull>(
	eq: (next: Value, last: Value) => unknown = Object.is,
) {
	return function (
		source: MultiSource<Value, Err, P>,
	): MultiSource<Value, Err, P> {
		return function ({ complete, error, next }) {
			let first = true
			let last: Value
			const props = source({
				complete,
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
