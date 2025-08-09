import { composePrism, trush } from '../_utils'

export function iso<There, Here>({
	get,
	set,
}: {
	get: (w: Here) => There
	set: (p: There) => Here
}) {
	const getter = (w: Here, onSuccess: (part: There) => void) =>
		onSuccess(get(w))
	return composePrism<There, Here, never>({
		emitter: getter,
		getter,
		modifier: (m, onSuccess, w) => m(get(w), (p) => onSuccess(set(p))),
		remover: trush,
		setter: (p, onSuccess) => onSuccess(set(p)),
	})
}
