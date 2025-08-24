import type { Modifier } from '../core/types'

import { _compo } from '../core/compose'

export function removableOpt<Part, Whole, E = 'empty'>({
	error,
	get,
	modifier,
	remove,
	set,
}: {
	error?: E
	get: (w: Whole) => Part | undefined
	modifier?: Modifier<Part, Whole>
	remove: (w: Whole) => Whole
	set: (p: Part, w: Whole) => Whole
}) {
	return _compo<Part, Whole, E, { optional: true }, { removable: true }>({
		getter: (w, next, err) => {
			const res = get(w)
			if (res === undefined) return err(error ?? ('empty' as E))
			return next(res)
		},
		modifier,
		remover: (s, next) => next(remove(s)),
		setter: (p, next, w) => next(set(p, w)),
	})
}
