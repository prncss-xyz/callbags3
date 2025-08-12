import { noop } from '@constellar/core'
import { fromInit } from '@prncss-xyz/utils'

import type { Init } from '../../../../types'
import type { Emitter } from '../types'

import { composeNonPrism, trush } from '../_utils'

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
	return composeNonPrism<Value, Res, 'empty'>({
		emitter,
		getter: (r, next, error) => {
			let dirty = false
			const { start, unmount } = emitter(
				(t) => {
					dirty = true
					next(t)
					unmount()
				},
				(e) => {
					error(e)
					unmount()
				},
				() => {
					if (!dirty) error('empty')
					unmount()
				},
			)(r)
			start()
		},
		modifier,
		remover: trush,
		setter: (p, next, w) => modifier((_t, next) => next(p), next, w),
	})
}
