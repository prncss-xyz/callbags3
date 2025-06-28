import { flow } from '@constellar/core'
import { modulo } from '@prncss-xyz/utils'

import { result } from '../../observe'
import { range } from '../../sources/loops'
import { fold } from '../folds/fold'
import { toArray } from '../folds/folds'
import { filter } from './filter'

describe('filter', () => {
	test('', () => {
		const res = flow(range(0, 4), filter(modulo(2)), fold(toArray()), result())
		expect(res).toEqual([1, 3])
	})
})
