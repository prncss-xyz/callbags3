import { describe } from 'node:test'

import { inArray } from '../bx/traversal'
import { focus } from '../core/focus'
import { observe } from '../extractors'
import { fold } from '../getters/scan'
import { range } from './loops'

describe('range', () => {
	const o = focus<number>()(fold(inArray()))
	it('sums range', () => {
		observe(range(0, 4), o, (v) => expect(v).toEqual([0, 1, 2, 3]))
	})
})
