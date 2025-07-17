import type { AnyMulti, AnyPull, Source } from '../callbags/sources/core'

import { safe } from '../callbags/operators/safe'
import { type InferGuard, isUnknown } from '../guards'
import { union } from '../tags'

export const [isEither, { err, succ }] = union({
	err: isUnknown,
	succ: isUnknown,
})

export type Succ<S> = InferGuard<typeof succ.is<S>>
export type Err<E> = InferGuard<typeof err.is<E>>
export type Either<S, E> = Err<E> | Succ<S>

export function safeEither<S, E, P extends AnyPull, M extends AnyMulti>() {
	return safe<S, E, Succ<S>, Err<E>, P, M>(succ.of, err.of)
}

export function chainEither<A, B, E, P extends AnyPull, M extends AnyMulti>(
	cb: (value: A) => Either<B, E>,
) {
	return function <E2>(source: Source<A, E2, P, M>): Source<B, E | E2, P, M> {
		return function (props) {
			return source({
				...props,
				next(value) {
					const res: Either<B, E> = cb(value)
					if (succ.is(res)) props.next(succ.get(res))
					else props.error(err.get(res))
				},
			})
		}
	}
}
