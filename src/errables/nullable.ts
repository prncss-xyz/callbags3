import { id } from '@constellar/core'
import { always } from '@prncss-xyz/utils'

import { DomainError } from '../errors'
import type { AnyMulti, AnyPull, Source } from '../sources/core'
import { isNullish } from '../guards'
export type Nullable<T> = T | null | undefined

export class NullishError extends DomainError {}
const nullishError = new NullishError()

export function nullable<S, E>() {
	return {
		toError: always(undefined) as (e: E) => undefined,
		toSuccess: id<S>,
	}
}

export function chainNullable<
	A,
	B,
	Index,
	P extends AnyPull,
	M extends AnyMulti,
>(cb: (value: A, index: Index) => B | null | undefined) {
	return function <Err>(
		source: Source<A, Index, Err, P, M>,
	): Source<B, Index, Err | NullishError, P, M> {
		return function (props) {
			return source({
				...props,
				next(value, index) {
					const res = cb(value, index)
					if (isNullish(res)) props.error(nullishError)
					else props.next(res, index)
				},
			})
		}
	}
}
