import { isoAssert } from '@prncss-xyz/utils'

import type { Modify, NonFunction } from '../../../../types'
import type { Optic } from '../core/types'

import { isFunction } from '../../../../guards/primitives'
import { getModifier, getSetter, isSetter, modToCPS } from '../core/compose'

function put<T, S, E, F>(o: Optic<T, S, E, Exclude<F, { getter: true }>>) {
	isoAssert(isSetter(o))
	return function (t: T) {
		return function (s: S): S {
			let res: S
			getSetter(o)(t, (s) => (res = s), s)
			return res!
		}
	}
}

function over<T, S, E, F>(o: Optic<T, S, E, Exclude<F, { getter: true }>>) {
	isoAssert(isSetter(o))
	return function (m: Modify<T>) {
		return function (s: S): S {
			let res: S
			getModifier(o)(modToCPS(m), (s) => (res = s), s)
			return res!
		}
	}
}

function remove<T, S, E, F>(
	o: Optic<T, S, E, Exclude<F, { getter: true }>, { optional: true }>,
) {
	isoAssert('remover' in o)
	return function (s: S): S {
		let res: S
		o.remover(s, (s) => (res = s))
		return res!
	}
}

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
		if (m === REMOVE) {
			return remove(o as any)
		}
		if (isFunction(m)) {
			return over(o)(m)
		}
		return put(o)(m)
	}
}
