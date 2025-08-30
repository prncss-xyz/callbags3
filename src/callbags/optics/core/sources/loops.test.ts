import { describe } from 'node:test'

import { inArray } from '../bx/traversal'
import { focus } from '../core/focus'
import { observe } from '../extractors'
import { fold } from '../getters/scan'
import { range } from './loops'

describe('range', () => {
	const o = focus<number>()(fold(inArray()))
	it('sums', () => {
		observe(o)({
			next(v) {
				expect(v).toEqual([0, 1, 2, 3])
			},
		})(range(0, 4))
	})
})
