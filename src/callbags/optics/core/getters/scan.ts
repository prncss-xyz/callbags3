import { id } from '@constellar/core'
import { fromInit } from '@prncss-xyz/utils'

import type { Init } from '../../../../types'

import { _compo } from '../core/compose'
import { sequence } from './sequence'

export function scan<Acc, Value, Res = Acc>({
	fold,
	init,
	result,
}: {
	fold: (value: Value, acc: Acc) => Acc
	init: Init<Acc>
	result?: (acc: Acc) => Res
}) {
	const res = result ?? (id as any)
	return sequence<Res, Value, never>((source) => {
		let acc = fromInit(init)
		return (n, e, c) => {
			const { start, unmount } = source(
				(v) => n(res((acc = fold(v, acc)))),
				e,
				c,
			)
			return {
				start: () => {
					start()
					n(res(acc))
				},
				unmount,
			}
		}
	})
}

export function fold<Acc, Value, Res = Acc>({
	fold,
	init,
	result,
}: {
	fold: (value: Value, acc: Acc) => Acc
	init: Init<Acc>
	result?: (acc: Acc) => Res
}) {
	const res = result ?? (id as any)
	return sequence<Res, Value, never>((source) => {
		let acc = fromInit(init)
		return (n, e, c) => {
			return source(
				(v) => (acc = fold(v, acc)),
				e,
				() => {
					n(res(acc))
					c()
				},
			)
		}
	})
}
