import { flow } from '@constellar/core'

import { result } from '../../observe/result'
import { range } from '../../sources'
import { fold, toArray } from '../folds'
import { window } from './window'

describe('window', () => {
	test('', () => {
		const res = flow(range(0, 5), window(3), fold(toArray()), result())
		expect(res).toEqual([
			[0, 1, 2],
			[1, 2, 3],
			[2, 3, 4],
		])
	})
})
