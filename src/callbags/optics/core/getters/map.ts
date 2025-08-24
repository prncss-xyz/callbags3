import { _compo } from '../core/compose'

export function map<A, B>(fn: (w: A) => B) {
	return _compo<B, A, never, { getter: true }>({
		getter: (w, next) => next(fn(w)),
	})
}
