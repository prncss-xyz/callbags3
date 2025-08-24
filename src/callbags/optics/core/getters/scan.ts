import { noop } from '@constellar/core'
import { fromInit } from '@prncss-xyz/utils'

import type { Init } from '../../../../types'

import { _compo } from '../core/compose'
import { sequence } from './sequence'

export function scan<Acc, Value, Res>({
	fold,
	init,
	result,
}: {
	fold: (value: Value, acc: Acc) => Acc
	init: Init<Acc>
	result: (acc: Acc) => Res
}) {
	return sequence<Res, Value, never>((next) => {
		let acc = fromInit(init)
		return (w) => {
			acc = fold(w, acc)
			next(result(acc))
			return {
				start: () => {
					next(result(acc))
				},
				unmount: noop,
			}
		}
	})
}
