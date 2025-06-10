import type { AnyMulti, AnyPull, Source } from '../sources/core'

export function filter<A, Index, P extends AnyPull, M extends AnyMulti>(
	cb: (value: A, index: Index) => unknown,
) {
	return function <Err>(
		source: Source<A, Index, Err, P, M>,
	): Source<A, Index, Err, P, M> {
		return function (props) {
			return source({
				...props,
				next(value, index) {
					if (cb(value, index)) props.next(value, index)
				},
			})
		}
	}
}
