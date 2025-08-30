import { flow } from '@constellar/core'

import { lens } from '.'
import { eq } from '../core/eq'
import { review, update, view } from '../extractors'

function prop<S, K extends keyof S>(k: K) {
	return lens<S[K], S>({
		get: (s) => s[k],
		set: (v, s) => ({ ...s, [k]: v }),
	})
}

describe('lens', () => {
	type S = { a: number; b: string }
	const o = flow(eq<S>(), prop('a'))
	it('view', () => {
		expect(view(o)({ a: 1, b: 'b' })).toBe(1)
	})
	it('put', () => {
		expect(update(o)(2)({ a: 1, b: 'b' })).toEqual({ a: 2, b: 'b' })
	})
	it('over', () => {
		expect(update(o)((x) => x + 1)({ a: 1, b: 'b' })).toEqual({ a: 2, b: 'b' })
	})
})

describe('composed lenses', () => {
	type S = { a: number; b: { c: string } }
	const o = flow(eq<S>(), prop('b'), prop('c'))
	it('review', () => {
		expect(() => {
			// @ts-expect-error view must fail with a lens
			review(o)
		}).toThrowError()
	})
	it('view', () => {
		const res = view(o)({ a: 1, b: { c: 'c' } })
		expect(res).toBe('c')
		expectTypeOf(res).toEqualTypeOf<string>()
	})
	it('put', () => {
		const res = update(o)('d')({ a: 1, b: { c: 'c' } })
		expect(res).toEqual({
			a: 1,
			b: { c: 'd' },
		})
		expectTypeOf(res).toEqualTypeOf<{ a: number; b: { c: string } }>()
	})
	it('over', () => {
		expect(update(o)((x) => x + 1)({ a: 1, b: { c: 'c' } })).toEqual({
			a: 1,
			b: { c: 'c1' },
		})
	})
})
