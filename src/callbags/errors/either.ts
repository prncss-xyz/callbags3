import type { AnyMulti, AnyPull, Source } from '../sources/core'

import { type InferGuard, isUnknown } from '../../guards'
import { union } from '../../unions'
import { safe } from '../operators/safe'

const EITHER = Symbol('EITHER')
export const [isEither, { err, succ }] = union(EITHER, {
	err: isUnknown,
	succ: isUnknown,
})

export type Succ<S> = InferGuard<typeof succ.is<S>>
export type Err<E> = InferGuard<typeof err.is<E>>
export type Either<S, E> = Err<E> | Succ<S>

export function safeEither<
	S,
	Context,
	E,
	P extends AnyPull,
	M extends AnyMulti,
>() {
	return safe<S, Context, E, Succ<S>, Err<E>, P, M>(succ.of, err.of)
}

export function chainEither<
	A,
	B,
	E,
	Context,
	P extends AnyPull,
	M extends AnyMulti,
>(cb: (value: A, context: Context) => Either<B, E>) {
	return function <E2>(
		source: Source<A, Context, E2, P, M>,
	): Source<B, Context, E | E2, P, M> {
		return function (props) {
			return source({
				...props,
				next(value) {
					const res: Either<B, E> = cb(value, props.context)
					if (succ.is(res)) props.next(succ.get(res))
					else props.error(err.get(res))
				},
			})
		}
	}
}
