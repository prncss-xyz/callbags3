import { isoAssert } from '@prncss-xyz/utils'

import type { Optic } from '../core/types'


export function review<T, S, E, F>(
	o: Optic<T, S, E, Exclude<F, { optional: true }>>,
) {
	isoAssert('reviewer' in o)
	return function (t: T): S {
		let res: S
		o.reviewer(t, (s) => (res = s))
		return res!
	}
}
