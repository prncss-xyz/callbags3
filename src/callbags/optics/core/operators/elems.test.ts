import { pipe } from '@constellar/core'

import { succ } from '../../../../errors'
import { focus } from '../core/focus'
import { preview, REMOVE, update, view } from '../extractors'
import { elems, type Elems } from './elems'
import { filter } from './filter'
import { fold } from './fold'
import { lens } from './lens'

function inArray<Value>(): Elems<Value[], Value, Value[]> {
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
describe('elems', () => {
	const o = focus<number[]>()(elems(inArray()))
	it('view', () => {
		expect(preview(o)([1, 2, 3])).toEqual(succ.of(1))
	})
	it('modify', () => {
		expect(update(o)((x) => x * 2)([1, 2, 3])).toEqual([2, 4, 6])
	})
	it('remove', () => {
		// @ts-expect-error REMOVE is not a valid modify
		update(o)(REMOVE)
	})
})
describe('compose with prism', () => {
	const o = focus<number[]>()(
		pipe(
			elems(inArray()),
			filter((x) => x % 2 === 0),
		),
	)
	it('modify', () => {
		expect(update(o)((x) => x * 2)([1, 2, 3])).toEqual([1, 4, 3])
	})
})
describe('compose with lens', () => {
	function prop<S, K extends keyof S>(k: K) {
		return lens<S[K], S>({
			get: (s) => s[k],
			set: (v, s) => ({ ...s, [k]: v }),
		})
	}
	const o = focus<{ a: number }[]>()(pipe(elems(inArray()), prop('a')))
	it('modify', () => {
		const res = update(o)((x) => x * 2)([{ a: 1 }, { a: 3 }])
		expect(res).toEqual([{ a: 2 }, { a: 6 }])
	})
	it.skip('modify, long array', { timeout: 20_000 }, () => {
		const xs: { a: number }[] = Array(50_000).fill({ a: 1 })
		expect(update(o)((x) => x * 2)(xs)[0]).toEqual({ a: 2 })
	})
})
describe('compose with elems', () => {
	const o = focus<number[][]>()(pipe(elems(inArray()), elems(inArray())))
	it('modify', () => {
		expect(
			update(o)((x) => x * 2)([
				[1, 2],
				[3, 4],
			]),
		).toEqual([
			[2, 4],
			[6, 8],
		])
	})
})
describe('fold', () => {
	const o = focus<number[]>()(
		pipe(
			elems(inArray()),
			filter((x) => x % 2 === 0),
			fold(inArray()),
		),
	)
	it('view', () => {
		expect(view(o)([1, 2, 3])).toEqual([2])
	})
})
