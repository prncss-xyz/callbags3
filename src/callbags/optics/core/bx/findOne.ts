import { append } from '@constellar/core'

import { removableOpt } from './removableOpt'

// TODO: check for identity
export function findOne<X>(p: (x: X) => boolean) {
	return removableOpt<X, X[]>({
		get: (xs) => xs.find(p),
		modifier: (m, next, xs) => {
			const index = xs.findIndex(p)
			if (index < 0) return next(xs)
			return m(xs[index]!, (x) =>
				next([...xs.slice(0, index), x, ...xs.slice(index + 1)]),
			)
		},
		remove: (xs) => {
			const index = xs.findIndex(p)
			if (index < 0) return xs
			return [...xs.slice(0, index), ...xs.slice(index + 1)]
		},
		set: (x, xs) => {
			const index = xs.findIndex(p)
			if (index < 0) return append(x, xs)
			return [...xs.slice(0, index), x, ...xs.slice(index + 1)]
		},
	})
}
