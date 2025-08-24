import type { Modifier } from '../core/types'

import { _compo } from '../core/compose'

// MAYBE: optimize for get === id or set === id

export function lens<Part, Whole>({
	get,
	modifier,
	remove,
	set,
}: {
	get: (w: Whole) => Part
	modifier?: Modifier<Part, Whole>
	remove?: (w: Whole) => Whole
	set: (p: Part, w: Whole) => Whole
}) {
	return _compo<Part, Whole, never, { optional: true }>({
		getter: (w, next) => next(get(w)),
		modifier,
		remover: remove ? (s, next) => next(remove(s)) : undefined,
		setter: (p, next, w) => next(set(p, w)),
	})
}
