import { id, noop, REMOVE } from '@constellar/core'
import { fromInit } from '@prncss-xyz/utils'

import type { Init } from '../../../../types'
import type { Emitter } from '../core/types'

import { _compo } from '../core/compose'

export type Elems<Acc, Value, Res> = {
	emitter: Emitter<Value, Res, never>
	fold: (value: Value, acc: Acc) => Acc
	init: Init<Acc>
	result?: (acc: Acc) => Res
}

export function elems<Acc, Value, Res>({
	emitter,
	fold,
	init,
	result,
}: {
	emitter: Emitter<Value, Res, never>
	fold: (value: Value, acc: Acc) => Acc
	init: Init<Acc>
	result?: (acc: Acc) => Res
}) {
	const modifier = (
		m: (t: Value, next: (t: Value) => void) => void,
		next: (s: Res) => void,
		s: Res,
	) => {
		let acc: Acc
		acc = fromInit(init)
		const { start, unmount } = emitter(
			(value) =>
				m(value, (t) => {
					if (t === REMOVE) return
					acc = fold(t, acc)
				}),
			noop,
			() => {
				next(result ? result(acc) : (acc as any))
				unmount()
			},
		)(s)
		start()
	}
	return _compo<Value, Res, 'empty', { prims: true; traversable: true }>({
		emitter,
		modifier,
		remover: (_s, next) => next((result ?? (id as any))(fromInit(init))),
	})
}
