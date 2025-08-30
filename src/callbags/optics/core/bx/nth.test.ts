import { flow } from '@constellar/core'

import { eq } from '../core/eq'
import { update, view } from '../extractors'
import { nth } from './nth'

describe('nth', () => {
	type Source = [number, string, boolean]
	const source: Source = [1, 'a', true]
	const o = flow(eq<Source>(), nth(1))
	it('view', () => {
		const res = view(o)(source)
		expectTypeOf(res).toEqualTypeOf<string>()
		expect(res).toBe('a')
	})
	it('put', () => {
		const res = update(o)('A')(source)
		expect(res).toEqual([1, 'A', true])
		expectTypeOf(res).toEqualTypeOf<Source>()
	})
})
