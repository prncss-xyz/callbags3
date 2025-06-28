import type { AnyPull, MultiSource } from '../../sources/core'

export function drop<Value, Context, Err, P extends AnyPull>(n: number) {
	return function (
		source: MultiSource<Value, Context, Err, P>,
	): MultiSource<Value, Context, Err, P> {
		return function ({ complete, context, error, next }) {
			let i = 0
			const props = source({
				complete,
				context,
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
