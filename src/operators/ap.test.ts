import { flow } from '@constellar/core'
import { range } from '../sources/loops'
import { ap } from './ap'
import { fold, toArray } from './folds'
import { result } from '../observe'

describe('ap', () => {
	test('', () => {
		const res = flow(
			range(0, 3),
			ap(
				(x) => x - 1,
				(x) => x + 1,
			),
			fold(toArray()),
			result(),
		)
		expect(res).toEqual([-1, 1, 0, 2, 1, 3])
	})
})
