import { flow } from '@constellar/core'
import { eq } from '@prncss-xyz/utils'

import { result } from '../../observe'
import { range } from '../../sources/loops'
import { fold } from '../folds/fold'
import { toArray } from '../folds/folds'
import { dropUntil } from './dropUntil'

describe('dropUntil', () => {
	test('', () => {
		const res = flow(range(0, 7), dropUntil(eq(3)), fold(toArray()), result())
		expect(res).toEqual([4, 5, 6])
	})
})
