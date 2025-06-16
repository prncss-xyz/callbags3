import { flow } from '@constellar/core'
import { describe, expect, test } from 'vitest'

import { iterable } from '../sources/pull'
import { fold } from './folds/fold'
import { toArray } from './folds/folds/base'
import { result } from '../observe'
import { interval } from '../sources'
import { map } from './map'
import { take } from './filters/take'
import { flattenMulti } from './flattenMulti'
import { pipe } from '@constellar/core'
import { proc } from '../proc'
import { range } from '../sources'
import { chainMulti } from './flattenMulti'

describe('flatten', () => {
	test('sync', () => {
		const res = flow(
			iterable([iterable([0, 1]), iterable([2, 3])]),
			flattenMulti(),
			fold(toArray()),
			result(),
		)
		expect(res).toEqual([0, 1, 2, 3])
	})
	test('async', async () => {
		const res = await flow(
			interval(15),
			map(() => interval(10)),
			flattenMulti(),
			take(4),
			fold(toArray()),
			result(),
		)
		expect(res).toEqual([0, 1, 0, 2])
	})
})

describe('chain', () => {
	it('', () => {
		const res = proc(
			range(0, 3),
			pipe(
				chainMulti((x) => range(x, x + 2)),
				fold(toArray()),
			),
		)
		expect(res).toEqual([0, 1, 1, 2, 2, 3])
	})
})
