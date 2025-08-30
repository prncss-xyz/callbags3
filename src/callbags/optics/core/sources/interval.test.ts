import { pipe } from '@constellar/core'
import { describe } from 'node:test'

import { inArray } from '../bx/traversal'
import { focus } from '../core/focus'
import { observe } from '../extractors'
import { fold } from '../getters/scan'
import { take } from '../getters/take'
import { interval } from './interval'

describe('interval', () => {
	const o = focus<number>()(pipe(take(4), fold(inArray())))
	it('sums interval', () => {
		observe(o)({
			next(v) {
				expect(v).toEqual([0, 1, 2, 3])
			},
		})(interval(10))
	})
})
