import type { AnyPull, MultiSource } from '../../sources/core'

export function drop<Value, Err, P extends AnyPull>(n: number) {
	return function (
		source: MultiSource<Value, Err, P>,
	): MultiSource<Value, Err, P> {
		return function ({ complete, error, next }) {
			let i = 0
			const props = source({
				complete,
				error,
				next(value) {
					if (i >= n) next(value)
					i++
				},
			})
			return props
		}
	}
}
