import type { AnyPull, MultiSource } from '../../sources/core'

export function dropWith<Value, Index, Err, P extends AnyPull>(
	eq: (next: Value, last: Value, index: Index) => unknown = Object.is,
) {
	return function (
		source: MultiSource<Value, Index, Err, P>,
	): MultiSource<Value, Index, Err, P> {
		return function ({ next, complete, error }) {
			let first = true
			let last: Value
			const props = source({
				next(value, index) {
					if (first || !eq(value, last!, index)) next(value, index)
					first = false
					last = value
				},
				complete,
				error,
			})
			return props
		}
	}
}
