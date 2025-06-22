import type { AnyPull, MultiSource } from '../../sources/core'

export function drop<Value, Context, Err, P extends AnyPull>(n: number) {
	return function (
		source: MultiSource<Value, Context, Err, P>,
	): MultiSource<Value, Context, Err, P> {
		return function ({ context, next, complete, error }) {
			let i = 0
			const props = source({
				context,
				next(value) {
					if (i >= n) next(value)
					i++
				},
				complete,
				error,
			})
			return props
		}
	}
}
