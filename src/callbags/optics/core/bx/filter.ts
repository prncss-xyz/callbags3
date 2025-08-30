import { fromInit } from '@prncss-xyz/utils'

import type { Init } from '../../../../types'

import { _compo, type Compo, trush } from '../core/compose'

export function filter<Here, There extends Here, Err = 'nothing'>(
	cond: (w: Here) => w is There,
	err?: Init<Err, [Here]>,
): Compo<There, Here, Err>
export function filter<Here, Err = 'nothing'>(
	cond: (w: Here) => boolean,
	err?: Init<Err, [Here]>,
): Compo<Here, Here, Err>
export function filter<Here, Err = 'nothing'>(
	cond: (w: Here) => boolean,
	err?: Init<Err, [Here]>,
) {
	const getter = (w: Here, next: (t: Here) => void, error: (e: Err) => void) =>
		cond(w) ? next(w) : error(err ? fromInit(err, w) : ('nothing' as any))
	return _compo<Here, Here, Err>({
		getter,
		remover: (w, next) => !cond(w) && next(w),
		reviewer: trush,
	})
}
