import { insert } from '@constellar/core'

import { cmp0, sortedAdd } from './_internals'
import type { Fold, Fold1 } from '../fold'

export function max<I>(): Fold<number, number, I> {
	return {
		fold: (t, acc) => (t > acc ? t : acc),
		init: -Infinity,
	}
}

export function min<I>(): Fold<number, number, I> {
	return {
		fold: (t, acc) => (t < acc ? t : acc),
		init: Infinity,
	}
}

export function maxWith<T, I>(cmp = cmp0<T>): Fold1<T, I> {
	return {
		fold: (t, acc) => (cmp(t, acc) > 0 ? t : acc),
	}
}

export function minWith<T, I>(cmp = cmp0<T>): Fold1<T, I> {
	return {
		fold: (t, acc) => (cmp(t, acc) < 0 ? t : acc),
	}
}

export function sort<T, I>(cmp = cmp0<T>): Fold<T, T[], I> {
	return {
		fold: sortedAdd(cmp),
		init: () => [],
	}
}

export function shuffle<T, I>(): Fold<T, T[], I> {
	return {
		fold(t, acc) {
			const i = Math.floor(Math.random() * (acc.length + 1))
			return insert(i, t, acc)
		},
		init: () => [],
	}
}
