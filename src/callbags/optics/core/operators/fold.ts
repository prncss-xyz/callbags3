import { fromInit } from '@prncss-xyz/utils'

import type { Init } from '../../../../types'
import type { Optic } from '../types'

import { composeNonPrism, inert, trush } from '../_utils'

export function fold<Value, S, E, P extends never | void>(
	o: Optic<Value, S, E, P>,
) {
	return function <Acc, Res>({
		fold,
		init,
		result,
	}: {
		fold: (value: Value, acc: Acc) => Acc
		init: Init<Acc>
		result: (acc: Acc) => Res
	}) {
		return composeNonPrism({
			emitter: 0 as any, // TODO: make emitter optional
			getter: (s: S, next, error) => {
				let acc: Acc
				acc = fromInit(init)
				const { start, unmount } = o.emitter(
					(value) => (acc = fold(value, acc)),
					(e) => (error(e), unmount()),
					() => (next(result(acc)), unmount()),
				)(s)
				start()
			},
			modifier: inert,
			remover: trush,
			setter: inert,
		})
	}
}
