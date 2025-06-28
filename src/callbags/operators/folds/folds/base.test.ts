import { flow } from '@constellar/core'

import { safeNullable } from '../../../errors/nullable'
import { result } from '../../../observe'
import { iterable } from '../../../sources/pull'
import { fold } from '../fold'
import { last } from './base'

describe('last', () => {
	test('defined', () => {
		const v = flow(iterable([1, 2, 3]), fold(last()), safeNullable(), result())
		expect(v).toBe(3)
	})
	test('undefined', () => {
		const v = flow(iterable([]), fold(last()), safeNullable(), result())
		expect(v).toBe(undefined)
	})
})
