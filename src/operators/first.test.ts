import { flow } from '@constellar/core'
import { iterable, once } from '../sources/pull'
import { opt } from '../errables/opt'
import { first } from './first'
import { safe } from './safe'
import { result } from '../observe/result'

describe('first', () => {
	test('defined', () => {
		const v = flow(once(1), first(), safe(opt()), result())
		expect(v).toBe(1)
	})
	test('undefined', () => {
		const v = flow(iterable([]), first(), safe(opt()), result())
		expect(v).toBe(undefined)
	})
})
