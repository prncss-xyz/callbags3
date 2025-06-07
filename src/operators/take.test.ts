import { flow } from '@constellar/core'
import { iterable } from '../sources/pull'
import { extract } from '../observe/extract'
import { opt } from '../errables/opt'
import { take } from './take'
import { interval } from '../sources/push'
import { fold } from './folds/fold'
import { toArray } from './folds/folds'

describe('take', () => {
	test('undefined', () => {
		const v = flow(
			iterable([1, 2, 3, 4, 5]),
			take(0),
			fold(toArray()),
			extract(opt()),
		)
		expect(v).toEqual([])
	})
	test('defined', () => {
		const v = flow(
			iterable([1, 2, 3, 4, 5]),
			take(3),
			fold(toArray()),
			extract(opt()),
		)
		expect(v).toEqual([1, 2, 3])
	})
	test('async', async () => {
		const v = await flow(interval(10), take(3), fold(toArray()), extract(opt()))
		expect(v).toEqual([0, 1, 2])
	})
})
