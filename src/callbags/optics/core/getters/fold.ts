import { id, toArray } from '@constellar/core'
import { fromInit } from '@prncss-xyz/utils'

import type { Init } from '../../../../types'
import type { _OpticArg, Optic } from '../core/types'

import { _compo, getEmitter } from '../core/compose'
import { inArray } from '../operators/traversal'

export function fold<Value, Acc, Res>({
	fold,
	init,
	result,
}: {
	fold: (value: Value, acc: Acc) => Acc
	init: Init<Acc>
	result?: (acc: Acc) => Res
}): <S, E, F>(o: Optic<Value, S, E, F>) => Optic<Res, S, never>
export function fold<Value, Acc, Res>({
	fold,
	init,
	result,
}: {
	fold: (value: Value, acc: Acc) => Acc
	init: Init<Acc>
	result?: (acc: Acc) => Res
}) {
	return function <S, E, F>(
		o: Optic<Value, S, E, F>,
	): _OpticArg<Res, S, { getter: true }> {
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
		}
	}
}
