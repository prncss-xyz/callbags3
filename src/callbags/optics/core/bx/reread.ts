import { _compo, trush } from '../core/compose'

export function reread<Whole>(over: (w: Whole) => Whole) {
	return _compo<Whole, Whole, never, never, { optional: true }>({
		getter: (w, next) => next(over(w)),
		setter: trush,
	})
}
