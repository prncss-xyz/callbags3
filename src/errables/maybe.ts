import { DomainError } from '../errors'
import { type Guarded, isUnknown, isVoid } from '../guards'
import type { AnyMulti, AnyPull, Source } from '../sources/core'
import { union } from '../unions'

const MAYBE = Symbol('MAYBE')
export const [isMaybe, { just, nothing }] = union(MAYBE, {
	just: isUnknown,
	nothing: isVoid,
})
export type Just<S> = Guarded<typeof just.is<S>>
export type Nothing = Guarded<typeof nothing.is>
export type Maybe<S> = Just<S> | Nothing

export class NothingError extends DomainError {}
const nothingError = new NothingError()

export function maybe<S>() {
	return {
		toError(_e: DomainError) {
			return nothing.void()
		},
		toSuccess(s: S) {
			return just.of(s)
		},
	}
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
