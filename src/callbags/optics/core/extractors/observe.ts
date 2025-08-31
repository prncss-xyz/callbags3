import { noop } from '@constellar/core'
import { fromInit, type Init } from '@prncss-xyz/utils'

import type { Optic, Source } from '../core/types'

import { isFunction } from '../../../../guards/primitives'
import { getEmitter, getGetter } from '../core/compose'
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

export function _get<T, S, EO, ES, F>(
	o: Optic<T, S, EO, F>,
	s: S | Source<S, ES>,
	success: (t: T) => void,
	err: (e: EO | ES) => void,
) {
	if (isFunction(s)) _first(s, o, success, err)
	else getGetter(o)(s, success, err)
}

export function _first<T, S, E1, E2, F>(
	source: Source<S, E1>,
	o: Init<Optic<T, S, E2, F>, [Eq<S>]>,
	success: (t: T) => void,
	error: (e: E1 | E2) => void,
) {
	const { start, unmount } = getEmitter(fromInit(o, eq()))(source)(
		(t) => {
			success(t)
			unmount()
		},
		error,
		() => unmount(),
	)
	start()
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
