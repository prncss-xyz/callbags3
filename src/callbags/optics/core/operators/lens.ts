import type { Modify } from '../../../../types'

import { composeNonPrism, trush } from '../_utils'
export function lens<Part, Whole>({
	get,
	mod,
	set,
}: {
	get: (w: Whole) => Part
	mod?: (m: Modify<Part>, w: Whole) => void
	set: (p: Part, w: Whole) => Whole
}) {
	const getter = (w: Whole, next: (part: Part) => void) =>
		next(get(w))
	return composeNonPrism<Part, Whole, never>({
		emitter: getter,
		getter,
		modifier: mod
			? // TODO: mod
				(m, next, w) => m(get(w), (p) => next(set(p, w)))
			: (m, next, w) => m(get(w), (p) => next(set(p, w))),
		remover: trush,
		setter: (p, next, w) => next(set(p, w)),
	})
}
