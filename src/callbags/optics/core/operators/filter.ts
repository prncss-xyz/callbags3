import { noop } from '@constellar/core'
import { fromInit } from '@prncss-xyz/utils'

import type { Init } from '../../../../types'
import type { Optic } from '../types'

import { composePrism, trush } from '../_utils'

export function filter<There extends Here, Here, Err = 'nothing'>(
	cond: (w: Here) => w is There,
	err?: Init<Err, [Here]>,
): <S, E1, P extends never | void>(
	o: Optic<Here, S, E1, P>,
) => Optic<There, S, E1 | Err, P>
export function filter<Here, Err = 'nothing'>(
	cond: (w: Here) => boolean,
	err?: Init<Err, [Here]>,
): <S, E1, P extends never | void>(
	o: Optic<Here, S, E1, P>,
) => Optic<Here, S, E1 | Err, P>
export function filter<Here, Err = 'nothing'>(
	cond: (w: Here) => boolean,
	err?: Init<Err, [Here]>,
) {
	return composePrism<Here, Here, Err>({
		emitter: (next, _err, complete) => (t) => {
      console.log('caca')
      console.log({ t })
			return {
				start: () => {
					if (cond(t)) next(t)
					complete()
				},
				unmount: noop,
			}
		},
		getter: (w, next, error) =>
			cond(w) ? next(w) : error(err ? fromInit(err, w) : ('nothing' as any)),
		modifier: (m, next, w) => (cond(w) ? m(w, (p) => next(p)) : next(w)),
		remover: trush,
		setter: trush,
	})
}
