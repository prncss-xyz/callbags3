import { flow } from '@constellar/core'
import { isNumber } from '@prncss-xyz/utils'

import { filter } from '.'
import { type Either, err, succ } from '../../../../errors'
import { eq } from '../core/eq'
import { preview, review, update, view } from '../extractors'

describe('filter', () => {
	type S = number
	const isOdd = (n: number) => n % 2 === 1
	const o = flow(eq<S>(), filter(isOdd))
	it('view, preview', () => {
		// @ts-expect-error view must fail with a prism
		view(o)
		const res = preview(o)(0)
		expect(res).toEqual(err.of('nothing'))
		expectTypeOf(res).toEqualTypeOf<Either<number, 'nothing'>>()
	})
	it('view, success', () => {
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
	it('should refine type', () => {
		const o = flow(eq<number | string>(), filter(isNumber))
		const res = preview(o)('')
		expectTypeOf(res).toEqualTypeOf<Either<number, 'nothing'>>()
	})
})
