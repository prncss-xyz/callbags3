import type { AnyMulti, AnyPull, Source } from '../sources/core'

export function map<A, B, Index, P extends AnyPull, M extends AnyMulti>(
	cb: (value: A, index: Index) => B,
) {
	return function <Err>(
		source: Source<A, Index, Err, P, M>,
	): Source<B, Index, Err, P, M> {
		return function (props) {
			return source({
				...props,
				next(value, index) {
					props.next(cb(value, index), index)
				},
			})
		}
	}
}
