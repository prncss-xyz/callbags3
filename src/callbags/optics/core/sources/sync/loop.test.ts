import { add, lt } from '@prncss-xyz/utils'

import { eq } from '../../core/eq'
import { collect } from '../../extractors/collect'
import { loop, range, times } from './loop'

const collector = collect(eq<number>())

describe('loop', () => {
	test('', () => {
		const res = collector(loop(0, lt(3), add(1)))
		expect(res).toEqual([0, 1, 2])
	})
})

describe('range', () => {
	test('ascending', () => {
		const res = collector(range(0, 3))
		expect(res).toEqual([0, 1, 2])
	})
	test('descending', () => {
		const res = collector(range(2, -1, -1))
		expect(res).toEqual([2, 1, 0])
	})
})

describe('times', () => {
	test('', () => {
		const res = collector(times(3))
		expect(res).toEqual([0, 1, 2])
	})
})
