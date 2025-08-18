import { remove, replace } from '@constellar/core'

import { err, succ } from '../../../../errors'
import { removable } from './removable'

export function at<X>(index: number) {
	return removable<X, X[], 'empty'>({
		get: (xs) => {
			if (index >= xs.length) return err.of('empty')
			return succ.of(xs.at(index)!)
		},
		remove: (xs) => remove(index, xs),
		set: (x: X, xs) => replace(x, index, xs),
	})
}
