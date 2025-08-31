import { isoAssert } from '@prncss-xyz/utils'

import type { Modify, NonFunction } from '../../../../types'
import type { Optic } from '../core/types'

import { isFunction } from '../../../../guards/primitives'
import { getModifier, getSetter, isSetter, modToCPS } from '../core/compose'

export const REMOVE = Symbol('REMOVE')

export function update<T, S, E, F>(
	o: Optic<
		T,
		S,
		E,
		Exclude<
			F,
			{
				getter: true
			}
		>,
		{ removable: true }
	>,
): (m: Modify<T> | NonFunction<T> | typeof REMOVE) => (s: S) => S
export function update<T, S, E, F>(
	o: Optic<
		T,
		S,
		E,
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

export function updateAsync<T, S, E, F>(
	o: Optic<
		T,
		S,
		E,
		Exclude<
			F,
			{
				getter: true
			}
		>,
		{ removable: true }
	>,
): (m: Modify<T> | NonFunction<T> | typeof REMOVE) => (s: S) => S
export function updateAsync<T, S, E, F>(
	o: Optic<
		T,
		S,
		E,
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

function _update<T, S, E, F>(
	o: Optic<T, S, E, Exclude<F, { getter: true }>>,
	s: S,
	t: Modify<T> | T | typeof REMOVE,
	resolve: (s: S) => void,
) {
	isoAssert(isSetter(o))
	if (t === REMOVE) {
		o.remover(s, resolve)
		return
	}
	if (isFunction(t)) {
		getModifier(o)(modToCPS(t), resolve, s)
		return
	}
	getSetter(o)(t, resolve, s)
}
