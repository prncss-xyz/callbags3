import { left, right, type Either } from '../errables'
import type { AnyMulti, AnyPull, Source } from '../sources/core'

export function chainEither<
	A,
	B,
	E,
	Index,
	P extends AnyPull,
	M extends AnyMulti,
>(cb: (value: A, index: Index) => Either<B, E>) {
	return function <Err>(
		source: Source<A, Index, Err, P, M>,
	): Source<B, Index, Err | E, P, M> {
		return function (props) {
			return source({
				...props,
				next(value, index) {
					const res: Either<B, E> = cb(value, index)
					if (right.is(res)) props.next(right.get(res), index)
					else props.error(left.get(res))
				},
			})
		}
	}
}
