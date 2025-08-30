import { flow } from '@constellar/core'
import { describe } from 'node:test'

import { inArray } from '../bx/traversal'
import { eq } from '../core/eq'
import { observe } from '../extractors'
import { fold } from '../getters/scan'
import { take } from '../getters/take'
import { interval } from './interval'

describe('interval', () => {
	const o = flow(eq<number>(), take(4), fold(inArray()))
	it('sums interval', () => {
		observe(interval(10), o, (res) => expect(res).toEqual([0, 1, 2, 3]))
	})
})
