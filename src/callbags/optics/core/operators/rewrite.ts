import { _compo, trush } from '../core/compose'

export function rewrite<Whole>(set: (next: Whole, last: Whole) => Whole) {
	return _compo<Whole, Whole, never, { optional: true }>({
		getter: trush,
		setter: (p, next, w) => next(set(p, w)),
	})
}
