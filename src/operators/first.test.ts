import { flow } from '@constellar/core'
import { iterable, once } from '../sources/pull'
import { safeNullable } from '../errables/nullable'
import { first } from './first'
import { result } from '../observe/result'

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
