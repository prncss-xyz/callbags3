import { flow } from '@constellar/core'

import { result } from '../../observe/result'
import { interval } from '../../sources'
import { range } from '../../sources/loops'
import { fold } from '../folds/fold'
import { toArray } from '../folds/folds'
import { take } from './take'

describe('take', () => {
	describe('sync', () => {
		test('undefined', () => {
			const res = flow(range(0, 10), take(0), fold(toArray()), result())
			expect(res).toEqual([])
		})
		test('defined', () => {
			const res = flow(range(0, 10), take(4), fold(toArray()), result())
			expect(res).toEqual([0, 1, 2, 3])
		})
	})
	describe('async', () => {
		test('undefined', async () => {
			const res = await flow(interval(10), take(0), fold(toArray()), result())
			expect(res).toEqual([])
		})
		test('defined', async () => {
			const res = await flow(interval(10), take(4), fold(toArray()), result())
			expect(res).toEqual([0, 1, 2, 3])
		})
	})
})
