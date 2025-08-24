import { id, noop } from '@constellar/core'
import { fromInit } from '@prncss-xyz/utils'

import type { Init } from '../../../../types'
import type { Emitter } from '../core/types'

import { _compo } from '../core/compose'

export type Traversal<Acc, Value, Res> = {
	emitter: Emitter<Value, Res, never>
	fold: (value: Value, acc: Acc) => Acc
	init: Init<Acc>
	result?: (acc: Acc) => Res
}

export function traversal<Acc, Value, Res>({
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
	return _compo<
		Value,
		Res,
		'empty',
		{
			prims: true
			traversable: true
		},
		{
			removable: true
		}
	>({
		emitter,
		modifier,
		remover: (_s, next) => next((result ?? (id as any))(fromInit(init))),
	})
}

export function inArray<Value>(): Traversal<Value[], Value, Value[]> {
	return {
		emitter: (next, _error, complete) => (acc) => {
			let done = false
			return {
				start: () => {
					for (const t of acc) {
						if (done) break
						next(t)
					}
					complete()
				},
				unmount: () => {
					done = true
				},
			}
		},
		fold: (t, acc) => [...acc, t],
		init: () => [],
	}
}

export function elems<T>() {
	return traversal(inArray<T>())
}
