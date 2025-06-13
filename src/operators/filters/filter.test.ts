import { flow } from '@constellar/core'
import { filter } from './filter'
import { fold } from '../folds/fold'
import { toArray } from '../folds/folds'
import { result } from '../../observe'
import { range } from '../../sources/range'
import { modulo } from '@prncss-xyz/utils'

describe('filter', () => {
	test('', () => {
		const res = flow(range(0, 4), filter(modulo(2)), fold(toArray()) , result())
		expect(res).toEqual([1, 3])
	})
})
