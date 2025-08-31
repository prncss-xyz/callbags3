import type { Emitter } from '../core/types'

import { _compo } from '../core/compose'

export function sequence<Part, Whole, E>(emitter: Emitter<Part, Whole, E>) {
	return _compo<
		Part,
		Whole,
		E,
		{
			getter: true
			optional: true
			traversable: true
		}
	>({
		emitter,
	})
}
