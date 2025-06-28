import { flow } from '@constellar/core'
import { lt } from '@prncss-xyz/utils'

import { result } from '../../observe'
import { range } from '../../sources/loops'
import { fold } from '../folds/fold'
import { toArray } from '../folds/folds'
import { dropWhile } from './dropWhile'

describe('dropWhile', () => {
	test('', () => {
		const res = flow(range(0, 7), dropWhile(lt(3)), fold(toArray()), result())
		expect(res).toEqual([4, 5, 6])
	})
})
