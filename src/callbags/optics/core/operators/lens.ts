import { composeNonPrism, trush } from '../_utils'

// MAYBE: optimize for get === id or set === id

export function lens<Part, Whole>({
	get,
	mod,
	set,
}: {
	get: (w: Whole) => Part
	mod?: (
		m: (p: Part, next: (p: Part) => void) => void,
		next: (w: Whole) => void,
		w: Whole,
	) => void
	set: (p: Part, w: Whole) => Whole
}) {
	const getter = (w: Whole, next: (part: Part) => void) => next(get(w))
	return composeNonPrism<Part, Whole, never>({
		getter,
		modifier: mod ? mod : (m, next, w) => m(get(w), (p) => next(set(p, w))),
		remover: trush,
		setter: (p, next, w) => next(set(p, w)),
	})
}
