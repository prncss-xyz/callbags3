import { noop } from '@constellar/core'
import { fromInit, type Init } from '@prncss-xyz/utils'

import type { Optic, Source } from '../core/types'

import {
	getEmitter,
} from '../core/compose'
import { eq, type Eq } from '../core/eq'

type Observer<T, E> =
	| ((t: T) => void)
	| Partial<{
			complete: () => void
			error: (e: E) => void
			next: (t: T) => void
	  }>

function resolveObserver<T, E>(observer: Observer<T, E>, unmount: () => void) {
	if (typeof observer === 'function') return [observer, noop, unmount] as const
	const { complete, error, next } = observer
	return [
		next ?? noop,
		error ?? noop,
		complete
			? () => {
					observer.complete!()
					unmount()
				}
			: unmount,
	] as const
}

export function _observe<T, S, E1, E2, F>(
	source: Source<S, E1>,
	o: Init<Optic<T, S, E2, F>, [Eq<S>]>,
	next: (t: T) => void,
	error: (e: E1 | E2) => void,
) {
	const { start, unmount } = getEmitter(fromInit(o, eq()))(source)(
		next,
		error,
		() => unmount,
	)
	start()
}

export function observe<T, S, E1, E2, F>(
	source: Source<S, E1>,
	o: Init<Optic<T, S, E2, F>, [Eq<S>]>,
	observer: Observer<T, E1 | E2>,
) {
	const { start, unmount } = getEmitter(fromInit(o, eq()))(source)(
		...resolveObserver(observer, () => unmount!),
	)
	start()
}
