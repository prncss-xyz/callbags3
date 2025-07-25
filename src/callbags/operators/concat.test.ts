import { flow } from '@constellar/core'

import { result } from '../observe'
import { iterable } from '../sources/pull'
import { concat } from './concat'
import { fold } from './folds/fold'
import { toArray } from './folds/folds/base'
import { toPush } from './toPush'

describe('concat', () => {
	test('sync', () => {
		const res = flow(
			iterable([0, 1]),
			concat(iterable(['a', 'b'])),
			fold(toArray()),
			result(),
		)
		expect(res).toEqual([0, 1, 'a', 'b'])
		expectTypeOf(res).toEqualTypeOf<(number | string)[]>()
	})
	test('async', async () => {
		const res = await flow(
			toPush(iterable([0, 1])),
			concat(toPush(iterable(['a', 'b']))),
			fold(toArray()),
			result(),
		)
		expect(res).toEqual([0, 1, 'a', 'b'])
		expectTypeOf(res).toEqualTypeOf<(number | string)[]>()
	})
})
