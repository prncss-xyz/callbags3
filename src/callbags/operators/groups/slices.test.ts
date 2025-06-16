import { flow } from '@constellar/core'
import { range } from '../../sources'
import { fold, toArray } from '../folds'
import { result } from '../../observe/result'
import { slices } from './slices'

describe('slices', () => {
	test('', () => {
		const res = flow(range(0, 7), slices(3), fold(toArray()), result())
		expect(res).toEqual([
			[0, 1, 2],
			[3, 4, 5],
		])
	})
})
