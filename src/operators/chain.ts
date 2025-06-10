import { error, success, type Either } from '../errables'
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
					if (success.is(res)) props.next(success.get(res) , index)
					else props.error(error.get(res))
				},
			})
		}
	}
}
