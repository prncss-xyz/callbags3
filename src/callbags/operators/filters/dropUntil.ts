import type { AnyPull, MultiSource } from '../../sources/core'

export function dropUntil<Value, Index, Err, P extends AnyPull>(
	cond: (value: Value, index: Index) => unknown,
) {
	return function (
		source: MultiSource<Value, Index, Err, P>,
	): MultiSource<Value, Index, Err, P> {
		return function ({ next, complete, error }) {
			let fulfilled: unknown = false
			const props = source({
				next(value, index) {
					if (fulfilled) next(value, index)
					fulfilled = fulfilled || cond(value, index)
				},
				complete,
				error,
			})
			return props
		}
	}
}
