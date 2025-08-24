import { pipe } from '@constellar/core'

import { focus } from '../core/focus'
import { collect } from '../extractors'
import { elems } from '../operators/traversal'
import { take } from './take'

describe('take', () => {
	const o = focus<number[]>()(pipe(elems(), take(2)))
	it('view', () => {
		expect(collect(o)([0, 1, 2, 3])).toBe([0, 1])
	})
})
