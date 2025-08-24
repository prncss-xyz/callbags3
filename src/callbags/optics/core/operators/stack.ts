import { append } from '@constellar/core'

import { removableOpt } from './removableOpt'

// defective
// aka append
// can represent a stack
export function stack<X>() {
	return removableOpt<X, X[], 'empty'>({
		get: (xs) => xs.at(-1),
		remove: (xs) => (xs.length ? xs.slice(0, -1) : xs),
		set: append,
	})
}
