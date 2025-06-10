import { isUnknown, type Guarded } from '../guards'
import type { AnyMulti, AnyPull, Source } from '../sources/core'
import { union } from '../unions'

const EITHER = Symbol('EITHER')
export const [isEither, { error, success }] = union(EITHER, {
	error: isUnknown,
	success: isUnknown,
})

export type Success<S> = Guarded<typeof success.is<S>>
export type Err<E> = Guarded<typeof error.is<E>>
export type Either<S, E> = Err<E> | Success<S>

export function either<S, E>() {
	return {
		toError(e: E) {
			return error.of(e)
		},
		toSuccess(s: S) {
			return success.of(s)
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
					if (success.is(res)) props.next(success.get(res), index)
					else props.error(error.get(res))
				},
			})
		}
	}
}
