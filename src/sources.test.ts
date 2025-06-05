import { flow } from '@constellar/core'
import { iterable, once } from './sources/pull'
import { opt } from './unions/opt'
import { extract } from './observe/extract'
import { fold, last } from './scan'
import { first } from './sinks/first'

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

describe('last', () => {
	test('defined', () => {
		const v = flow(iterable([1, 2, 3]), fold(last()), extract(opt()))
		expect(v).toBe(3)
	})
	test('undefined', () => {
		const v = flow(iterable([]), fold(last()), extract(opt()))
		expect(v).toBe(undefined)
	})
})
