import { flow } from '@constellar/core'

import { tap } from './tap'
import { iterable } from '../sources'
import { fold, last } from './folds'
import { result } from '../observe/result'
import { safeNullable } from '../errables/nullable'

describe('tap', () => {
	test('', () => {
		const cb = vi.fn()
		flow(iterable([1, 2, 3]), tap(cb), fold(last()), safeNullable(), result())
		expect(cb.mock.calls).toEqual([
			[1, 0],
			[2, 1],
			[3, 2],
		])
	})
})
