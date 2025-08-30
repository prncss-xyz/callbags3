import { noop } from '@constellar/core'

import type { _OpticArg, Optic } from '../core/types'

import { _compo, getGetter, getSetter, trush } from '../core/compose'
import { eq, type Eq } from '../core/eq'

export function resolve<K, T, S, E1, F1, T1>(
	r: (k: K) => (eq: Eq<S>) => Optic<T, S, E1, F1, T1>,
): <E2>(t: Optic<K, S, E2>) => Optic<T, S, E1 | E2>
export function resolve<K, T, S, E1>(
	r: (k: K) => (eq: Eq<S>) => _OpticArg<T, S, E1>,
) {
	return function <E2>(t: Optic<K, S, E2>): _OpticArg<T, S, E1 | E2> {
		const opt = (k: K) => r(k)(eq()) // TODO: cache
		if ('getter' in t)
			return {
				getter: (s, next, err) =>
					t.getter(s, (k) => getGetter(opt(k))(s, next, err), err),
				remover: trush,
				setter: (p, next, s) =>
					t.getter(
						s,
						(k) => {
							const o = opt(k)
							if ('setter' in o || 'modifier' in o) {
								getSetter(o)(p, next, s)
							}
						},
						noop,
					),
			}
		throw new Error('not implemented')
	}
}
