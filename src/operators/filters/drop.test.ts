import { flow } from '@constellar/core'
import { fold } from '../folds/fold'
import { toArray } from '../folds/folds'
import { result } from '../../observe'
import { range } from '../../sources/loops'
import { drop } from './drop'

describe('drop', () => {
	test('', () => {
		const res = flow(range(0, 7), drop(4), fold(toArray()), result())
		expect(res).toEqual([4, 5, 6])
	})
})
