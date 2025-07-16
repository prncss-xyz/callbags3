import { flow } from '@constellar/core'

import { safeNullable } from '../../errors/nullable'
import { result } from '../observe/result'
import { iterable } from '../sources'
import { fold, last } from './folds'
import { tap } from './tap'

describe('tap', () => {
	test('', () => {
		const cb = vi.fn()
		flow(iterable([1, 2, 3]), tap(cb), fold(last()), safeNullable(), result(2))
		expect(cb.mock.calls).toEqual([
			[1, 2],
			[2, 2],
			[3, 2],
		])
	})
})
