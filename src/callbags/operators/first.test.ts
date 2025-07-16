import { flow } from '@constellar/core'

import { safeNullable } from '../../errors'
import { result } from '../observe/result'
import { iterable, once } from '../sources/pull'
import { first } from './first'

describe('first', () => {
	test('defined', () => {
		const v = flow(once(1), safeNullable(), result())
		expect(v).toBe(1)
	})
	test('undefined', () => {
		const v = flow(iterable([]), first(), safeNullable(), result())
		expect(v).toBe(undefined)
	})
})
