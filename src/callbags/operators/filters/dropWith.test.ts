import { flow } from '@constellar/core'

import { result } from '../../observe'
import { iterable } from '../../sources'
import { fold } from '../folds/fold'
import { toArray } from '../folds/folds'
import { dropWith } from './dropWith'

describe('dropWith', () => {
	test('', () => {
		const res = flow(
			iterable([0, 0, 1, 2, 0, 3, 3, 4]),
			dropWith(),
			fold(toArray()),
			result(),
		)
		expect(res).toEqual([0, 1, 2, 0, 3, 4])
	})
})
