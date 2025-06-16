import type { AnyPull, MultiSource } from '../../sources/core'

export function takeUntil<Value, Index, Err, P extends AnyPull>(
	cond: (value: Value, index: Index) => unknown,
) {
	return function (
		source: MultiSource<Value, Index, Err, P>,
	): MultiSource<Value, Index, Err, P> {
		return function ({ next, complete, error }) {
			const props = source({
				next(value, index) {
					next(value, index)
					if (cond(value, index)) complete()
				},
				complete,
				error,
			})
			return props
		}
	}
}
