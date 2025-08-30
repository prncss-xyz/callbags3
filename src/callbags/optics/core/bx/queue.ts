import { append } from '@constellar/core'

import { removableOpt } from './removableOpt'

// defective
export function queue<X>() {
	return removableOpt<X, X[], 'empty'>({
		get: (xs) => xs.at(0),
		remove: (xs) => (xs.length ? xs.slice(1) : xs),
		set: append,
	})
}
