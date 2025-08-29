import type { Optic } from './types'

import { trush } from './compose'

export type Eq<T> = Optic<T, T, never>

export type Focus<T, S, E, O extends Optic<T, S, E>> = (eq: Eq<S>) => O

export function eq<T>(): Eq<T> {
	return {
		getter: trush,
		modifier: undefined,
		remover: trush,
		reviewer: trush,
	} as any
}

export function focus<S>() {
	return function <T, E, O extends Optic<T, S, E>>(o: Focus<T, S, E, O>) {
		return o(eq())
	}
}
