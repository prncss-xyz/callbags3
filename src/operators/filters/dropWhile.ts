import type { AnyPull, MultiSource } from '../../sources/core'

export function dropWhile<Value, Index, Err, P extends AnyPull>(
	cond: (value: Value, index: Index) => unknown,
) {
	return function (
		source: MultiSource<Value, Index, Err, P>,
	): MultiSource<Value, Index, Err, P> {
		return function ({ next, complete, error }) {
			let closed: unknown = true
			const props = source({
				next(value, index) {
					if (!closed) next(value, index)
					closed = closed && cond(value, index)
				},
				complete,
				error,
			})
			return props
		}
	}
}
