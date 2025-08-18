import { _compo, trush } from '../core/compose'

// MAYBE: optimize for get === id or set === id

export function lens<Part, Whole>({
	get,
	set,
}: {
	get: (w: Whole) => Part
	set: (p: Part, w: Whole) => Whole
}) {
	return _compo<Part, Whole, never, { optional: true }>({
		getter: (w, next) => next(get(w)),
		remover: trush,
		setter: (p, next, w) => next(set(p, w)),
	})
}
