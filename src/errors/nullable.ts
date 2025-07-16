import { id } from '@constellar/core'
import { always } from '@prncss-xyz/utils'

import type { AnyMulti, AnyPull, Source } from '../callbags/sources/core'

import { safe } from '../callbags/operators/safe'
import { isNullish } from '../guards'
import { type Nothing, nothing } from './maybe'
export type Nullable<T> = null | T | undefined

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
	Context,
	P extends AnyPull,
	M extends AnyMulti,
>(cb: (value: A, context: Context) => B | null | undefined) {
	return function <Err>(
		source: Source<A, Context, Err, P, M>,
	): Source<B, Context, Err | Nothing, P, M> {
		return function (props) {
			return source({
				...props,
				next(value) {
					const res = cb(value, props.context)
					if (isNullish(res)) props.error(nothing.void())
					else props.next(res)
				},
			})
		}
	}
}
