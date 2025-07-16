import type { Prettify } from '@constellar/core'

import { just, type Just, type Maybe, nothing, type Nothing } from './core'

type AllJust<O, P> = {
	[K in keyof O]: Just<never> extends O[K] ? true : false
}[keyof O] extends true
	? P
	: never
type UnwrapJust<O> = AllJust<
	O,
	Prettify<
		Just<{
			[K in keyof O]: Just<unknown> & O[K] extends Just<infer M> ? M : never
		}>
	>
>
type UnwrapNothing<O> = {
	[K in keyof O]: Nothing extends O[K] ? Nothing : never
}[keyof O]

export type UnwrapMaybe<O> = Prettify<UnwrapJust<O> | UnwrapNothing<O>>

export function unwrapMaybeObj<O extends Record<PropertyKey, Maybe<unknown>>>(
	o: O,
): UnwrapMaybe<O> {
	const res: any = {}
	for (const [k, m] of Object.entries(o)) {
		if (nothing.is(m)) return nothing.void() as never
		res[k] = just.get(m)
	}
	return just.of(res) as never
}
