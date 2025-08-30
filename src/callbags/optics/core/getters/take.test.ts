import { pipe } from '@constellar/core'

import { focus } from '../core/focus'
import { collect } from '../extractors'
import { elems } from '../bx/traversal'
import { take } from './take'

describe('take', () => {
	it('view', () => {
		const o = focus<number[]>()(pipe(elems(), take(2)))
		expect(collect(o)([0, 1, 2, 3])).toEqual([0, 1])
    // it should be idempotent
    expect(collect(o)([0, 1, 2, 3])).toEqual([0, 1])
	})
	it('view', () => {
		const o = focus<number[]>()(pipe(elems(), take(0)))
		expect(collect(o)([0, 1, 2, 3])).toEqual([])
	})
})
