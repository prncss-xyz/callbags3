import { _compo, trush } from '../core/compose'

// MAYBE: optimize for get === id or set === id

export function lens<Part, Whole>({
	get,
	set,
}: {
	get: (w: Whole) => Part
	set: (p: Part, w: Whole) => Whole
}) {
	const getter = (w: Whole, next: (part: Part) => void) => next(get(w))
	return _compo<Part, Whole, never, { optional: true }>({
		getter,
		modifier: (m, next, w) => m(get(w), (p) => next(set(p, w))),
		remover: trush,
		setter: (p, next, w) => next(set(p, w)),
	})
}
