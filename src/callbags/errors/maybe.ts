import { type Guarded, isUnknown, isVoid } from '../../guards'
import { safe } from '../operators/safe'
import type { AnyMulti, AnyPull, Source } from '../sources/core'
import { union } from '../../unions'
import { nothingError, type NothingError } from './nothingError'

const MAYBE = Symbol('MAYBE')
export const [isMaybe, { just, nothing }] = union(MAYBE, {
	just: isUnknown,
	nothing: isVoid,
})
export type Just<S> = Guarded<typeof just.is<S>>
export type Nothing = Guarded<typeof nothing.is>
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

export function chainMaybe<A, B, Index, P extends AnyPull, M extends AnyMulti>(
	cb: (value: A, index: Index) => Maybe<B>,
) {
	return function <Err>(
		source: Source<A, Index, Err, P, M>,
	): Source<B, Index, Err | NothingError, P, M> {
		return function (props) {
			return source({
				...props,
				next(value, index) {
					const res = cb(value, index)
					if (just.is(res)) props.next(just.get(res), index)
					else props.error(nothingError)
				},
			})
		}
	}
}
