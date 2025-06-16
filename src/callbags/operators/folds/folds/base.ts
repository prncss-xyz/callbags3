import { id } from '@constellar/core'
import type { Fold } from '../fold'

export function last<Value>() {
	return {
		fold: id<Value>,
	}
}

export function toArray<Value, Index>(): Fold<Value, Value[], Index, Value[]> {
	return {
		fold: (t, acc) => [...acc, t],
		foldDest(t, acc) {
			acc.push(t)
			return acc
		},
		init: () => [],
	}
}
