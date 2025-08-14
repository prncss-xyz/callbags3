import { composeNonPrism, inert, trush } from '../_utils'

export function getter<Part, Whole>(get: (w: Whole) => Part) {
	const getter = (w: Whole, next: (part: Part) => void) => next(get(w))
	return composeNonPrism<Part, Whole, never, never>({
		getter,
		modifier: inert,
		remover: trush,
		setter: inert,
	})
}
