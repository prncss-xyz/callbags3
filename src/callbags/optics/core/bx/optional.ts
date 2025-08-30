import type { Either } from '../../../../errors'

import { _compo } from '../core/compose'

export function optional<Part, Whole, E>({
	get,
	set,
}: {
	get: (w: Whole) => Either<Part, E>
	set: (p: Part, w: Whole) => Whole
}) {
	return _compo<Part, Whole, E, { optional: true }>({
		getter: (w, next, err) => {
			const res = get(w)
			if (res.type === 'err') return err(res.value)
			return next(res.value)
		},
		remover: (w, next) => get(w).type === 'err' && next(w),
		setter: (p, next, w) => next(set(p, w)),
	})
}
