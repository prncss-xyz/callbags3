import type { AnyPull, MultiSource } from '../../sources/core'

export function drop<Value, Index, Err, P extends AnyPull>(n: number) {
	return function (
		source: MultiSource<Value, Index, Err, P>,
	): MultiSource<Value, Index, Err, P> {
		return function ({ next, complete, error }) {
			let i = 0
			const props = source({
				next(value, index) {
					if (i >= n) next(value, index)
					i++
				},
				complete,
				error,
			})
			return props
		}
	}
}
