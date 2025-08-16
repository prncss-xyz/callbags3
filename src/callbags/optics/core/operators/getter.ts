import { _compo } from '../core/compose'

export function getter<Part, Whole>(get: (w: Whole) => Part) {
	return _compo<Part, Whole, never, { getter: true }>({
		getter: (w, next) => next(get(w)),
	})
}
