import { flow } from '@constellar/core'

import { iterable } from '../../../sources/pull'
import { fold } from '../fold'
import { fromEntries, join, joinLast, productFold, sumFold } from './misc'
import { result } from '../../../observe/result'

describe('sumFold', () => {
	test('', () => {
		const res = flow(iterable([2, 3, 4]), fold(sumFold()), result())
		expect(res).toBe(9)
	})
})

describe('productFold', () => {
	test('', () => {
		const res = flow(iterable([2, 3, 4]), fold(productFold()), result())
		expect(res).toBe(24)
	})
})

describe('join', () => {
	test('', () => {
		const res = flow(iterable(['a', 'b', 'c']), fold(join(',')), result())
		expect(res).toBe('a,b,c')
	})
})

describe('joinLast', () => {
	test('', () => {
		const res = flow(iterable(['a', 'b', 'c']), fold(joinLast(',')), result())
		expect(res).toBe('a,b,c,')
	})
})

describe('fromEntries', () => {
	test('', () => {
		const res = flow(
			iterable<[string, number]>([
				['a', 0],
				['b', 1],
				['c', 2],
			]),
			fold(fromEntries()),
			result(),
		)
		expect(res).toEqual({
			a: 0,
			b: 1,
			c: 2,
		})
	})
})
