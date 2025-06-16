import { id } from '@constellar/core'
import { always } from '@prncss-xyz/utils'

import type { AnyMulti, AnyPull, Source } from '../sources/core'
import { isNullish } from '../../guards'
import { safe } from '../operators/safe'
import { nothingError, type NothingError } from './nothingError'
export type Nullable<T> = T | null | undefined

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
	): Source<B, Index, Err | NothingError, P, M> {
		return function (props) {
			return source({
				...props,
				next(value, index) {
					const res = cb(value, index)
					if (isNullish(res)) props.error(nothingError)
					else props.next(res, index)
				},
			})
		}
	}
}
