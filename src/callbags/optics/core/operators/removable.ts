import type { Either } from '../../../../errors'

import { _compo } from '../core/compose'

export function removable<Part, Whole, E>({
	get,
	remove,
	set,
}: {
	get: (w: Whole) => Either<Part, E>
	remove: (w: Whole) => Whole
	set: (p: Part, w: Whole) => Whole
}) {
	return _compo<Part, Whole, E, { optional: true }, { removable: true }>({
		getter: (w, next, err) => {
			const res = get(w)
			if (res.type === 'err') return err(res.value)
			return next(res.value)
		},
		remover: (s, next) => next(remove(s)),
		setter: (p, next, w) => next(set(p, w)),
	})
}
