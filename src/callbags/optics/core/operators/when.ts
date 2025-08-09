import { fromInit } from '@prncss-xyz/utils'

import type { Init } from '../../../../types'
import type { Optic } from '../types'

import { apply, composePrism, trush } from '../_utils'

// aka prism
export function when<There extends Here, Here, Err = 'nothing'>(
	cond: (w: Here) => w is There,
	err?: Init<Err, [Here]>,
): <S, E1, P extends never | void>(
	o: Optic<Here, S, E1, P>,
) => Optic<There, S, E1 | Err, P>
export function when<Here, Err = 'nothing'>(
	cond: (w: Here) => boolean,
	err?: Init<Err, [Here]>,
): <S, E1, P extends never | void>(
	o: Optic<Here, S, E1, P>,
) => Optic<Here, S, E1 | Err, P>
export function when<Here, Err = 'nothing'>(
	cond: (w: Here) => boolean,
	err?: Init<Err, [Here]>,
) {
	return composePrism<Here, Here, Err>({
		emitter: (w, next) => cond(w) && next(w),
		getter: (w, next, error) =>
			cond(w) ? next(w) : error(err ? fromInit(err, w) : ('nothing' as any)),
		modifier: apply, // TODO:
		remover: trush,
		setter: trush,
	})
}
