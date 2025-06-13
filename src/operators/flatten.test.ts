import { flow } from '@constellar/core'
import { describe, expect, test } from 'vitest'

import { flatten } from './flatten'
import { iterable } from '../sources/pull'
import { fold } from './folds/fold'
import { toArray } from './folds/folds/base'
import { result } from '../observe'
import { interval } from '../sources'
import { map } from './map'
import { take } from './filters/take'

describe('flatten', () => {
	test('sync', () => {
		const res = flow(
			iterable([iterable([0, 1]), iterable([2, 3])]),
			flatten(),
			fold(toArray()),
			result(),
		)
		expect(res).toEqual([0, 1, 2, 3])
	})
	test('async', async () => {
		const res = await flow(
			interval(15),
			map(() => interval(10)),
			flatten(),
			take(4),
			fold(toArray()),
			result(),
		)
		expect(res).toEqual([0, 1, 0, 2])
	})
})
