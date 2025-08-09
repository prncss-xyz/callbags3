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
	const getter = (w: Whole, onSuccess: (part: Part) => void) =>
		onSuccess(get(w))
	return composeNonPrism<Part, Whole, never>({
		emitter: getter,
		getter,
		modifier: mod
			? // TODO: mod
				(m, onSuccess, w) => m(get(w), (p) => onSuccess(set(p, w)))
			: (m, onSuccess, w) => m(get(w), (p) => onSuccess(set(p, w))),
		remover: trush,
		setter: (p, onSuccess, w) => onSuccess(set(p, w)),
	})
}
