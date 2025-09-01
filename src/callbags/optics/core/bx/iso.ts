import { noop } from '@constellar/core'

import { _compo } from '../core/compose'

export function iso<There, Here>({
	get,
	set,
}: {
	get: (w: Here) => There
	set: (p: There) => Here
}) {
	return _compo<
		There,
		Here,
    never,
		never,
		// eslint-disable-next-line @typescript-eslint/no-empty-object-type
		{},
		{
			removable: true
		}
	>({
		getter: (w, next) => next(get(w)),
		remover: noop,
		reviewer: (p, next) => next(set(p)),
	})
}
