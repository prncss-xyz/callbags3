import type { LTAGS, Optic, Prism, TAGS } from './types'

import { trush } from './compose'

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type Eq<T> = Prism<T, T, never> & { [LTAGS]: {} } & { [TAGS]: {} }

export type Focus<T, S, E, F, LF> = (eq: Eq<S>) => Optic<T, S, E, F, LF>

// TODO: remove

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export function tagged<F = {}>() {
	return function <T>(t: T) {
		// eslint-disable-next-line @typescript-eslint/no-empty-object-type
		return t as T & { [LTAGS]: {} } & { [TAGS]: F }
	}
}

const _t = tagged()

export function eq<T>(): Eq<T> {
	return _t({
		getter: trush,
		remover: trush,
		reviewer: trush,
	})
}

export function focus<S>() {
	return function <T, E, F, LF>(o: Focus<T, S, E, F, LF>) {
		return o(eq())
	}
}
