import { flow } from '@constellar/core'

import { tap } from './tap'
import { iterable } from '../sources'
import { fold, last } from './folds'
import { result } from '../observe/result'
import { safeNullable } from '../errors/nullable'

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
