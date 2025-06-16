import { isUnknown, type Guarded } from '../guards'
import { safe } from '../operators/safe'
import type { AnyMulti, AnyPull, Source } from '../sources/core'
import { union } from '../unions'

const EITHER = Symbol('EITHER')
export const [isEither, { err, succ }] = union(EITHER, {
	err: isUnknown,
	succ: isUnknown,
})

export type Succ<S> = Guarded<typeof succ.is<S>>
export type Err<E> = Guarded<typeof err.is<E>>
export type Either<S, E> = Err<E> | Succ<S>

export function safeEither<
	S,
	Index,
	E,
	P extends AnyPull,
	M extends AnyMulti,
>() {
	return safe<S, Index, E, Succ<S>, Err<E>, P, M>(succ.of, err.of)
}

export function chainEither<
	A,
	B,
	E,
	Index,
	P extends AnyPull,
	M extends AnyMulti,
>(cb: (value: A, index: Index) => Either<B, E>) {
	return function <E2>(
		source: Source<A, Index, E2, P, M>,
	): Source<B, Index, E2 | E, P, M> {
		return function (props) {
			return source({
				...props,
				next(value, index) {
					const res: Either<B, E> = cb(value, index)
					if (succ.is(res)) props.next(succ.get(res), index)
					else props.error(err.get(res))
				},
			})
		}
	}
}
