import { fromInit } from '@prncss-xyz/utils'

import type { Init } from '../../../../types'
import type { Optic } from '../core/types'

import { _compo, trush } from '../core/compose'

export function filter<Here, There extends Here, Err = 'nothing'>(
	cond: (w: Here) => w is There,
	err?: Init<Err, [Here]>,
): <S, E1, F>(o: Optic<Here, S, E1, F>) => Optic<There, S, E1 | Err, F>
export function filter<Here, Err = 'nothing'>(
	cond: (w: Here) => boolean,
	err?: Init<Err, [Here]>,
): <S, E1, F>(o: Optic<Here, S, E1, F>) => Optic<Here, S, E1 | Err, F>
export function filter<Here, Err = 'nothing'>(
	cond: (w: Here) => boolean,
	err?: Init<Err, [Here]>,
) {
	return _compo<Here, Here, Err>({
		getter: (w, next, error) =>
			cond(w) ? next(w) : error(err ? fromInit(err, w) : ('nothing' as any)),
		modifier: (m, next, w) => (cond(w) ? m(w, (p) => next(p)) : next(w)),
		remover: trush,
		reviewer: trush,
	})
}
