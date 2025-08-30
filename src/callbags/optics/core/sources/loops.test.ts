import { flow } from '@constellar/core'
import { describe } from 'node:test'

import { inArray } from '../bx/traversal'
import { eq } from '../core/eq'
import { observe } from '../extractors'
import { fold } from '../getters/scan'
import { range } from './loops'

describe('range', () => {
	const o = flow(eq<number>(), fold(inArray()))
	it('sums range', () => {
		observe(range(0, 4), o, (v) => expect(v).toEqual([0, 1, 2, 3]))
	})
})
