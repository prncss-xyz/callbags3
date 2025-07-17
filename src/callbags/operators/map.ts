import type { AnyMulti, AnyPull, Source } from '../sources/core'

export function map<A, B, P extends AnyPull, M extends AnyMulti, Err>(
	cb: (value: A) => B,
) {
	return function (source: Source<A, Err, P, M>): Source<B, Err, P, M> {
		return function (props) {
			return source({
				...props,
				next(value) {
					props.next(cb(value))
				},
			})
		}
	}
}
