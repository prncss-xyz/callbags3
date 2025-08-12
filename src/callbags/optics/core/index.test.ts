import { pipe } from '@constellar/core'

import { err, succ } from '../../../errors'
import { preview, review, update, view } from './extractors'
import { filter, focus, iso, lens } from './operators'

describe('iso', () => {
	type S = { a: number }
	const o = focus<S>()(iso({ get: (s) => s.a, set: (a) => ({ a }) }))
	it('view', () => {
		expect(view(o)({ a: 1 })).toBe(1)
	})
	it('put', () => {
		expect(review(o)(2)).toEqual({ a: 2 })
	})
	it('over', () => {
		expect(update(o)((x) => x + 1)({ a: 1 })).toEqual({ a: 2 })
	})
})

function prop<S, K extends keyof S>(k: K) {
	return lens<S[K], S>({
		get: (s) => s[k],
		set: (v, s) => ({ ...s, [k]: v }),
	})
}

describe('lens', () => {
	type S = { a: number; b: string }
	const o = focus<S>()(prop('a'))
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
	const o = focus<S>()(pipe(prop('b'), prop('c')))
	it('view', () => {
		expect(view(o)({ a: 1, b: { c: 'c' } })).toBe('c')
	})
	it('put', () => {
		expect(update(o)('d')({ a: 1, b: { c: 'c' } })).toEqual({
			a: 1,
			b: { c: 'd' },
		})
	})
	it('over', () => {
		expect(update(o)((x) => x + 1)({ a: 1, b: { c: 'c' } })).toEqual({
			a: 1,
			b: { c: 'c1' },
		})
	})
})

describe('when', () => {
	type S = number
	const isOdd = (n: number) => n % 2 === 1
	const o = focus<S>()(filter(isOdd))
	it('view', () => {
		expect(preview(o)(0)).toEqual(err.of('nothing'))
		expect(preview(o)(1)).toEqual(succ.of(1))
	})
	it('put', () => {
		expect(review(o)(0)).toEqual(0)
		expect(review(o)(1)).toEqual(1)
	})
	it('over', () => {
		expect(update(o)((x) => x + 1)(0)).toBe(0)
		expect(update(o)((x) => x + 1)(1)).toBe(2)
	})
})
