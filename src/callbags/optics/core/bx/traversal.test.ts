import { pipe } from '@constellar/core'

import { succ } from '../../../../errors'
import { focus } from '../core/focus'
import { preview, REMOVE, update, view } from '../extractors'
import { fold } from '../getters/fold'
import { filter } from './filter'
import { lens } from './lens'
import { elems } from './traversal'

describe('elems', () => {
	const o = focus<number[]>()(elems())
	it('view', () => {
		expect(preview(o)([1, 2, 3])).toEqual(succ.of(1))
	})
	it('modify', () => {
		expect(update(o)((x) => x * 2)([1, 2, 3])).toEqual([2, 4, 6])
	})
	it('remove', () => {
		expect(update(o)(REMOVE)([1, 2, 3])).toEqual([])
	})
})
describe('compose with prism', () => {
	const o = focus<number[]>()(
		pipe(
			elems(),
			filter((x) => x % 2 === 0),
		),
	)
	it('modify', () => {
		expect(update(o)((x) => x * 2)([1, 2, 3])).toEqual([1, 4, 3])
	})
	it('remove', () => {
		// @ts-expect-error REMOVE is not a valid modify
		expect(update(o)(REMOVE)([1, 2, 3])).toEqual([1, 3])
	})
})
describe('compose with lens', () => {
	function prop<S, K extends keyof S>(k: K) {
		return lens<S[K], S>({
			get: (s) => s[k],
			set: (v, s) => ({ ...s, [k]: v }),
		})
	}
	const o = focus<{ a: number }[]>()(pipe(elems(), prop('a')))
	it('modify', () => {
		const res = update(o)((x) => x * 2)([{ a: 1 }, { a: 3 }])
		expect(res).toEqual([{ a: 2 }, { a: 6 }])
	})
  // this is to make sure the call stack doesn't grow with data length
	it.skip('modify, long array', { timeout: 20_000 }, () => {
		const xs: { a: number }[] = Array(50_000).fill({ a: 1 })
		expect(update(o)((x) => x * 2)(xs)[0]).toEqual({ a: 2 })
	})
})
describe('compose with elems', () => {
	const o = focus<number[][]>()(pipe(elems(), elems()))
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
			elems(),
			filter((x) => x % 2 === 0),
			fold({
				fold: (x, y) => x + y,
				init: 100,
			}),
		),
	)
	it('view', () => {
		expect(view(o)([1, 2, 3])).toEqual(102)
	})
})
