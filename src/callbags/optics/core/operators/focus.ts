import type { Optic } from '../types'

import { apply, trush } from '../_utils'

type Eq<T> = Optic<T, T, never, void, true>

export type Focus<T, S, E, P extends void, _F> = (
	eq: Eq<S>,
) => Optic<T, S, E, P, _F>

export function eq<T>(): Eq<T> {
	return {
		getter: trush,
		modifier: apply,
		remover: trush,
		setter: trush,
	}
}

export function focus<S>() {
	return function <T, E, P extends void, F>(o: Focus<T, S, E, P, F>) {
		return o(eq())
	}
}
