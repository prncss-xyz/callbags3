import { flow } from '@constellar/core'
import { iterable } from '../sources/pull'
import { extract } from '../observe/extract'
import { opt } from '../unions/opt'
import { collect } from '../scan/folds/base'
import { take } from './take'
import { fold } from '../scan/fold'
import { interval } from '../sources/push'

describe('take', () => {
	test('undefined', () => {
		const v = flow(
			iterable([1, 2, 3, 4, 5]),
			take(0),
			fold(collect()),
			extract(opt()),
		)
		expect(v).toEqual([])
	})
	test('defined', () => {
		const v = flow(
			iterable([1, 2, 3, 4, 5]),
			take(3),
			fold(collect()),
			extract(opt()),
		)
		expect(v).toEqual([1, 2, 3])
	})
	test('async', async () => {
		const v = await flow(interval(10), take(3), fold(collect()), extract(opt()))
		expect(v).toEqual([0, 1, 2])
	})
})
