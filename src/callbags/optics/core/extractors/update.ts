import { isoAssert } from '@prncss-xyz/utils'

import type { Modify, NonFunction } from '../../../../types'
import type { Optic } from '../core/types'

import { isFunction } from '../../../../guards/primitives'
import { getModifier, getSetter, isSetter } from '../core/compose'

export const REMOVE = Symbol('REMOVE')

export function update<T, S, EG, EF, F>(
	o: Optic<
		T,
		S,
		EG, EF,
		Exclude<
			F,
			{
				getter: true
			}
		>,
		{ removable: true }
	>,
): (m: Modify<T> | NonFunction<T> | typeof REMOVE) => (s: S) => S
export function update<T, S, EG, EF, F>(
	o: Optic<
		T,
		S,
		EG, EF,
		Exclude<
			F,
			{
				getter: true
			}
		>
	>,
): (m: Modify<T> | NonFunction<T>) => (s: S) => S
export function update<T, S, E, F>(
	o: Optic<T, S, E, Exclude<F, { getter: true }>>,
) {
	return function (m: Modify<T> | NonFunction<T>) {
		return function (s: S): S {
			let res: S
			_update(o, s, m, (r) => (res = r))
			return res!
		}
	}
}

export function updateAsync<T, S, EG, EF, F>(
	o: Optic<
		T,
		S,
		EG, EF,
		Exclude<
			F,
			{
				getter: true
			}
		>,
		{ removable: true }
	>,
): (m: Modify<T> | NonFunction<T> | typeof REMOVE) => (s: S) => S
export function updateAsync<T, S, EG, EF, F>(
	o: Optic<
		T,
		S,
		EG, EF,
		Exclude<
			F,
			{
				getter: true
			}
		>
	>,
): (m: Modify<T> | NonFunction<T>) => (s: S) => S
export function updateAsync<T, S, E, F>(
	o: Optic<T, S, E, Exclude<F, { getter: true }>>,
) {
	return function (m: Modify<T> | NonFunction<T>) {
		return function (s: S): Promise<S> {
			return new Promise<S>((resolve) => {
				_update(o, s, m, resolve)
			})
		}
	}
}

function modToCPS<T>(m: Modify<T>) {
	return (t: T, next: (t: T) => void) => next(m(t))
}

function _update<T, S, EG, EF, F>(
	o: Optic<T, S, EG, EF, Exclude<F, { getter: true }>>,
	s: S,
	m: Modify<T> | T | typeof REMOVE,
	resolve: (s: S) => void,
) {
	isoAssert(isSetter(o))
	if (m === REMOVE) {
		o.remover(s, resolve)
		return
	}
	if (isFunction(m)) {
		getModifier(o)(modToCPS(m), resolve, s)
		return
	}
	getSetter(o)(m, resolve, s)
}
