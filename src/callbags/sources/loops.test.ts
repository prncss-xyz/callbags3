import { flow } from '@constellar/core'
import { add, lt } from '@prncss-xyz/utils'

import { result } from '../observe/result'
import { fold } from '../operators/folds/fold'
import { toArray } from '../operators/folds/folds/base'
import { loop, range, times } from './loops'

describe('range', () => {
	test('asc', () => {
		const res = flow(range(0, 3), fold(toArray()), result())
		expect(res).toEqual([0, 1, 2])
	})
	test('dsc', () => {
		const res = flow(range(2, -1, -1), fold(toArray()), result())
		expect(res).toEqual([2, 1, 0])
	})
})

describe('times', () => {
	test('', () => {
		const res = flow(times(3), fold(toArray()), result())
		expect(res).toEqual([0, 1, 2])
	})
})

describe('loop', () => {
	test('', () => {
		const r = flow(loop(lt(3), add(1), 0), fold(toArray()), result())
		expect(r).toEqual([0, 1, 2])
	})
})
