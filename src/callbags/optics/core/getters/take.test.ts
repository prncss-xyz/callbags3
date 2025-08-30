import { flow } from '@constellar/core'

import { elems } from '../bx/traversal'
import { eq } from '../core/eq'
import { collect } from '../extractors'
import { take } from './take'

describe('take', () => {
	it('view', () => {
		const o = flow(eq<number[]>(), elems(), take(2))
		expect(collect(o)([0, 1, 2, 3])).toEqual([0, 1])
		// it should be idempotent
		expect(collect(o)([0, 1, 2, 3])).toEqual([0, 1])
	})
	it('view', () => {
		const o = flow(eq<number[]>(), elems(), take(0))
		expect(collect(o)([0, 1, 2, 3])).toEqual([])
	})
})
