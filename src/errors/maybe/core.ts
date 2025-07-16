import type { AnyMulti, AnyPull, Source } from '../../callbags/sources/core'

import { safe } from '../../callbags/operators/safe'
import { type InferGuard, isUnknown, isVoid } from '../../guards'
import { union } from '../../tags'

export const [isMaybe, { just, nothing }] = union({
	just: isUnknown,
	nothing: isVoid,
})

export type Just<S> = InferGuard<typeof just.is<S>>
export type Nothing = InferGuard<typeof nothing.is>
export type Maybe<S> = Just<S> | Nothing

export function safeMaybe<
	Succ,
	Index,
	Err,
	P extends AnyPull,
	M extends AnyMulti,
>() {
	return safe<Succ, Index, Err, Just<Succ>, Nothing, P, M>(
		just.of.bind(just),
		nothing.of.bind(nothing) as never,
	)
}

export function chainMaybe<
	A,
	B,
	Context,
	P extends AnyPull,
	M extends AnyMulti,
>(cb: (value: A, context: Context) => Maybe<B>) {
	return function <Err>(
		source: Source<A, Context, Err, P, M>,
	): Source<B, Context, Err | Nothing, P, M> {
		return function (props) {
			return source({
				...props,
				next(value) {
					const res = cb(value, props.context)
					if (just.is(res)) props.next(just.get(res))
					else props.error(nothing.void())
				},
			})
		}
	}
}
