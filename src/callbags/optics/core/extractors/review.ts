import { isoAssert } from '@prncss-xyz/utils'

import type { Optic } from '../core/types'

export function review<T, S, EG, EF, F>(
	o: Optic<T, S, EG, EF, Exclude<F, { optional: true }>>,
) {
	isoAssert('reviewer' in o)
	return function (t: T): S {
		let res: S
		o.reviewer(t, (s) => (res = s))
		return res!
	}
}

export function reviewAsync<T, S, EG, EF, F>(
	o: Optic<T, S, EG, EF, Exclude<F, { optional: true }>>,
) {
	isoAssert('reviewer' in o)
	return function (t: T) {
		return new Promise<S>((resolve) => {
			o.reviewer(t, resolve)
		})
	}
}
