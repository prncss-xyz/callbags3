import { noop } from '@constellar/core'
import { fromInit } from '@prncss-xyz/utils'

import type { Init } from '../../../../types'

import { composeNonPrism, inert, trush } from '../_utils'

export function scan<Acc, Value, Res>({
	fold,
	init,
	result,
}: {
	fold: (value: Value, acc: Acc) => Acc
	init: Init<Acc>
	result: (acc: Acc) => Res
}) {
	return composeNonPrism<Res, Value, never>({
		emitter: (next) => {
			let acc = fromInit(init)
			next(result(acc))
			return (w) => {
				acc = fold(w, acc)
				next(result(acc))
				return noop
			}
		},
		getter: (w, next) => next(result(fold(w, fromInit(init)))),
		modifier: inert,
		remover: trush,
		setter: inert,
	})
}
