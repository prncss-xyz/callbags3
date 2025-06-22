import type { AnyMulti, AnyPull, Source } from '../sources/core'

export function map<A, B, Context, P extends AnyPull, M extends AnyMulti, Err>(
	cb: (value: A, index: Context) => B,
) {
	return function (
		source: Source<A, Context, Err, P, M>,
	): Source<B, Context, Err, P, M> {
		return function (props) {
			return source({
				...props,
				next(value) {
					props.next(cb(value, props.context))
				},
			})
		}
	}
}
