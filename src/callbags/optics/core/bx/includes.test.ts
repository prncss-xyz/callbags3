import { flow } from '@constellar/core'

import { eq } from '../core/eq'
import { update } from '../extractors/update'
import { view } from '../extractors/view'
import { includes } from './includes'
import { rewrite } from './rewrite'

describe('includes', () => {
	const sourceDefined = ['a', 'b', 'c']
	const sourceUndefined = ['a', 'c']
	const o = flow(
		eq<string[]>(),
		rewrite((x) => x.sort()),
		includes('b'),
	)
	describe('view', () => {
		it('defined', () => {
			expect(view(o)(sourceDefined)).toBeTruthy()
		})
		it('undefined', () => {
			expect(view(o)(sourceUndefined)).toBeFalsy()
		})
	})
	describe('put', () => {
		it('defined, true', () => {
			expect(update(o)(true)(sourceDefined)).toEqual(['a', 'b', 'c'])
		})
		it('defined, false', () => {
			expect(update(o)(false)(sourceDefined)).toEqual(['a', 'c'])
		})
		it('undefined, true', () => {
			expect(update(o)(true)(sourceUndefined)).toEqual(['a', 'b', 'c'])
		})
		it('undefined, false', () => {
			expect(update(o)(false)(sourceUndefined)).toEqual(['a', 'c'])
		})
	})
})
