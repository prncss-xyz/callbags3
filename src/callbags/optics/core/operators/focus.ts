import type { Focus, Optic } from '../types'

import { apply, trush } from '../_utils'

export function eq<T>(): Optic<T, T, never, void> {
	return {
		getter: trush,
		modifier: apply,
		remover: trush,
		setter: trush,
	}
}

export function focus<S>() {
	return function <T, E, P extends never | void>(o: Focus<T, S, E, P>) {
		return o(eq())
	}
}
