import type { Optic, Prism, TAGS } from './types'

import { apply, trush } from './compose'

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type Eq<T> = Prism<T, T, never> & { [TAGS]: {} }

export type Focus<T, S, E, F> = (eq: Eq<S>) => Optic<T, S, E> & { [TAGS]: F }

// TODO: remove

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export function tagged<F = {}>() {
	return function <T>(t: T) {
		return t as T & { [TAGS]: F }
	}
}

const _t = tagged()

export function eq<T>(): Eq<T> {
	return _t({
		getter: trush,
		modifier: apply,
		remover: trush,
		reviewer: trush,
	})
}

export function focus<S>() {
	return function <T, E, F>(o: Focus<T, S, E, F>) {
		return o(eq())
	}
}
