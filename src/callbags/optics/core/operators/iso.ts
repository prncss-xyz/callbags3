import { composePrism, trush } from '../_utils'

export function iso<There, Here>({
	get,
	set,
}: {
	get: (w: Here) => There
	set: (p: There) => Here
}) {
	const getter = (w: Here, next: (part: There) => void) => next(get(w))
	return composePrism<There, Here, never, unknown>({
		getter,
		modifier: (m, next, w) => m(get(w), (p) => next(set(p))),
		remover: trush,
		setter: (p, next) => next(set(p)),
	})
}
