import { _compo, trush } from '../core/compose'

export function iso<There, Here>({
	get,
	set,
}: {
	get: (w: Here) => There
	set: (p: There) => Here
}) {
	return _compo<There, Here, never>({
		getter: (w, next) => next(get(w)),
		remover: trush,
		reviewer: (p, next) => next(set(p)),
	})
}
