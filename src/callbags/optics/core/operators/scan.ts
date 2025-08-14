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
	return composeNonPrism<Res, Value, never, unknown>({
		emitter: (next) => {
			let acc = fromInit(init)
			return (w) => {
				acc = fold(w, acc)
				next(result(acc))
				return {
					start: () => {
						next(result(acc))
					},
					unmount: () => {},
				}
			}
		},
		modifier: inert,
		remover: trush,
	})
}
