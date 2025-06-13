import { isUnknown, type Guarded } from '../guards'
import type { AnyMulti, AnyPull, Source } from '../sources/core'
import { union } from '../unions'

const EITHER = Symbol('EITHER')
export const [isEither, { left, right }] = union(EITHER, {
	left: isUnknown,
	right: isUnknown,
})

export type Right<S> = Guarded<typeof right.is<S>>
export type Left<E> = Guarded<typeof left.is<E>>
export type Either<S, E> = Left<E> | Right<S>

export function either<S, E>() {
	return {
		toError(e: E) {
			return left.of(e)
		},
		toSuccess(s: S) {
			return right.of(s)
		},
	}
}

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
