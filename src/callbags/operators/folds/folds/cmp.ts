import { insert } from '@constellar/core'

import type { Fold, Fold1 } from '../fold'

import { cmp0, sortedAdd } from './_internals'

export function max(): Fold<number> {
	return {
		fold: (t, acc) => (t > acc ? t : acc),
		init: -Infinity,
	}
}

export function min(): Fold<number> {
	return {
		fold: (t, acc) => (t < acc ? t : acc),
		init: Infinity,
	}
}

export function maxWith<T>(cmp = cmp0<T>): Fold1<T> {
	return {
		fold: (t, acc) => (cmp(t, acc) > 0 ? t : acc),
	}
}

export function minWith<T>(cmp = cmp0<T>): Fold1<T> {
	return {
		fold: (t, acc) => (cmp(t, acc) < 0 ? t : acc),
	}
}

export function sort<T>(cmp = cmp0<T>): Fold<T, T[]> {
	return {
		fold: sortedAdd(cmp),
		init: () => [],
	}
}

export function shuffle<T>(): Fold<T, T[]> {
	return {
		fold(t, acc) {
			const i = Math.floor(Math.random() * (acc.length + 1))
			return insert(i, t, acc)
		},
		init: () => [],
	}
}
