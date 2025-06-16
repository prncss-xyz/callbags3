import { id } from '@constellar/core'
import { always } from '@prncss-xyz/utils'

import { DomainError } from '../errors'
import type { AnyMulti, AnyPull, Source } from '../sources/core'
import { isNullish } from '../guards'
import { safe } from '../operators/safe'
export type Nullable<T> = T | null | undefined

export class NullishError extends DomainError {}
const nullishError = new NullishError()

export function safeNullable<
	Succ,
	Index,
	Err,
	P extends AnyPull,
	M extends AnyMulti,
>() {
	return safe<Succ, Index, Err, Succ, undefined, P, M>(id, always(undefined))
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
