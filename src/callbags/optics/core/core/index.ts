import { _compo } from '../core/compose'
import { focus } from '../core/focus'
import { review, update, view } from '../extractors'
import { lens } from '../operators'
import { iso } from '../operators/iso'

describe('prism', () => {
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

describe('lens', () => {
	type S = { a: number }
	const o = focus<S>()(lens({ get: (s) => s.a, set: (a) => ({ a }) }))
	it('view', () => {
		expect(view(o)({ a: 1 })).toBe(1)
	})
	it('put', () => {
		// @ts-expect-error put must fail with a lens
		expect(review(o)(2)).toEqual({ a: 2 })
	})
	it('over', () => {
		expect(update(o)((x) => x + 1)({ a: 1 })).toEqual({ a: 2 })
	})
})
