import type { Either } from '../../../../errors'

import { _compo } from '../core/compose'

export function optional<Part, Whole, E>({
	get,
	remove,
	set,
}: {
	get: (w: Whole) => Either<Part, E>
	remove?: (w: Whole) => Whole
	set: (p: Part, w: Whole) => Whole
}) {
	return _compo<Part, Whole, E, { optional: true }>({
		getter: (w, next, err) => {
			const res = get(w)
			if (res.type === 'err') return err(res.value)
			return next(res.value)
		},
		modifier: (m, next, w) => {
			const res = get(w)
			if (res.type === 'err') return
			return m(res.value, (p) => next(set(p, w)))
		},
		remover: remove ? (s, next) => next(remove(s)) : (s, next) => next(s),
		setter: (p, next, w) => next(set(p, w)),
	})
}
