import { flow } from '@constellar/core'
import { iterable, once } from '../sources/pull'
import { opt } from '../errables/opt'
import { extract } from '../observe/extract'
import { first } from './first'

describe('first', () => {
	test('defined', () => {
		const v = flow(once(1), first(), extract(opt()))
		expect(v).toBe(1)
	})
	test('undefined', () => {
		const v = flow(iterable([]), first(), extract(opt()))
		expect(v).toBe(undefined)
	})
})
