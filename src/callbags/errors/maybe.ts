import type { AnyMulti, AnyPull, Source } from '../sources/core'

import { type InferGuard, isUnknown, isVoid } from '../../guards'
import { union } from '../../unions'
import { safe } from '../operators/safe'
import { nothingError, type NothingError } from './nothingError'

const MAYBE = Symbol('MAYBE')
export const [isMaybe, { just, nothing }] = union(MAYBE, {
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
		nothing.of.bind(nothing) as any,
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
	): Source<B, Context, Err | NothingError, P, M> {
		return function (props) {
			return source({
				...props,
				next(value) {
					const res = cb(value, props.context)
					if (just.is(res)) props.next(just.get(res))
					else props.error(nothingError)
				},
			})
		}
	}
}
