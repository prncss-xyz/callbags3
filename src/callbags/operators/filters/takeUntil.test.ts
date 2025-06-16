import { flow } from '@constellar/core'
import { fold } from '../folds/fold'
import { toArray } from '../folds/folds'
import { result } from '../../observe'
import { range } from '../../sources/loops'
import { eq } from '@prncss-xyz/utils'
import { takeUntil } from './takeUntil'

describe('takeUntil', () => {
	test('', () => {
		const res = flow(range(0, 10), takeUntil(eq(3)), fold(toArray()), result())
		expect(res).toEqual([0, 1, 2, 3])
	})
})
