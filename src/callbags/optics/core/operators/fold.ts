import { id } from '@constellar/core'
import { fromInit } from '@prncss-xyz/utils'

import type { Init } from '../../../../types'
import type { Optic } from '../types'

import { getEmitter, inert, trush } from '../_utils'

export function fold<Value, Acc, Res>({
	fold,
	init,
	result,
}: {
	fold: (value: Value, acc: Acc) => Acc
	init: Init<Acc>
	result?: (acc: Acc) => Res
}) {
	return function <S, E, P extends void>(
		o: Optic<Value, S, E, P>,
	): Optic<Res, S, never, never> {
		return {
			getter: (s, next) => {
				let acc: Acc
				acc = fromInit(init)
				const { start, unmount } = getEmitter(o)(
					(value) => (acc = fold(value, acc)),
					() => {
						unmount()
						throw new Error('unexpected error')
					},
					() => (unmount(), next((result ?? (id as any))(acc))),
				)(s)
				start()
			},
			modifier: inert,
			remover: trush,
			setter: inert,
		}
	}
}
