import { noop } from '@constellar/core'
import { fromInit } from '@prncss-xyz/utils'

import type { Init } from '../../../../types'
import type { Emitter } from '../types'

import { composeMulti, trush } from '../_utils'

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
			(value) => m(value, (t) => (acc = fold(t, acc))),
			noop,
			() => {
				next(result ? result(acc) : (acc as any))
				unmount()
			},
		)(s)
		start()
	}
	return composeMulti<Value, Res, 'empty'>({
		emitter,
		modifier,
		remover: trush,
	})
}
