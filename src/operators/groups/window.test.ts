import { flow } from '@constellar/core'
import { range } from '../../sources'
import { window } from './window'
import { fold, toArray } from '../folds'
import { result } from '../../observe/result'

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
