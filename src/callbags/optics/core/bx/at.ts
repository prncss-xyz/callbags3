import { remove, replace } from '@constellar/core'

import { removableOpt } from './removableOpt'

export function at<X>(index: number) {
	return removableOpt<X, X[], 'empty'>({
		get: (xs) => {
			return xs.at(index)
		},
		remove: (xs) => remove(index, xs),
		set: (x: X, xs) => replace(x, index, xs),
	})
}
