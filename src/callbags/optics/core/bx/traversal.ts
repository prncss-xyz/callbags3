import { id, noop } from '@constellar/core'
import { fromInit } from '@prncss-xyz/utils'

import type { Init } from '../../../../types'
import type { Source } from '../core/types'

import { _compo } from '../core/compose'

export type Traversal<Acc, Value, Res> = {
	fold: (value: Value, acc: Acc) => Acc
	init: Init<Acc>
	result?: (acc: Acc) => Res
	source: (r: Res) => Source<Value, never>
}

export function traversal<Acc, Value, Res>({
	fold,
	init,
	result,
	source,
}: {
	fold: (value: Value, acc: Acc) => Acc
	init: Init<Acc>
	result?: (acc: Acc) => Res
	source: (r: Res) => Source<Value, never>
}) {
	const modifier = (
		m: (t: Value, next: (t: Value) => void) => void,
		next: (s: Res) => void,
		s: Res,
	) => {
		let acc: Acc
		acc = fromInit(init)
		const { start, unmount } = source(s)(
			(value) =>
				m(value, (t) => {
					acc = fold(t, acc)
				}),
			noop,
			() => {
				next(result ? result(acc) : (acc as any))
				unmount()
			},
		)
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
		emitter: <E>(s: Source<Res, E>) => {
			return (next, error, complete) => {
				let unmount = noop
				const su = s(
					(r) => {
						const ss = source(r)(next, error, noop)
						unmount = ss.unmount
						ss.start()
					},
					noop,
					complete,
				)
				return {
					start: su.start,
					unmount: () => {
						unmount()
						su.unmount()
					},
				}
			}
		},
		modifier,
		remover: (_s, next) => next((result ?? (id as any))(fromInit(init))),
	})
}

export function inArray<Value>(): Traversal<Value[], Value, Value[]> {
	return {
		fold: (t, acc) => [...acc, t],
		init: () => [],
		source: (acc) => (next, _error, complete) => {
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
	}
}

export function elems<T>() {
	return traversal(inArray<T>())
}
