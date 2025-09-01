import type { Optic } from './types'

import { trush } from './compose'

export type Eq<T, EF = never> = Optic<T, T, never, EF>

export type Focus<T, S, EG, EF, O extends Optic<T, S, EG, EF>> =
	| ((eq: Eq<S>) => O)
	| Optic<T, S, EG, EF>

export function eq<T, E = never>(): Eq<T, E> {
	return {
		getter: trush,
		modifier: undefined,
		remover: trush,
		reviewer: trush,
	} as any
}
