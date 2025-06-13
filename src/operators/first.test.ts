import { flow } from '@constellar/core'
import { iterable, once } from '../sources/pull'
import { nullable } from '../errables/nullable'
import { first } from './first'
import { safe } from './safe'
import { result } from '../observe/result'

describe('first', () => {
	test('defined', () => {
		const v = flow(once(1), first(), safe(nullable()), result())
		expect(v).toBe(1)
	})
	test('undefined', () => {
		const v = flow(iterable([]), first(), safe(nullable()), result())
		expect(v).toBe(undefined)
	})
})
