import { flow, shallowEqual } from '@constellar/core'

import { max, maxWith, min, shuffle, sort } from './cmp'
import { empty, iterable } from '../../../sources/pull'
import { fold } from '../fold'
import { result } from '../../../observe/result'
import { safe } from '../../safe'
import { nullable } from '../../../errables/nullable'

describe('maxWith', () => {
	test('empty', () => {
		const res = flow(
			empty<number, void>(),
			fold(maxWith((a, b) => a - b)),
			safe(nullable()),
			result(),
		)
		expect(res).toEqual(undefined)
	})
	test('defined', () => {
		const res = flow(
			iterable([0, 2, 1]),
			fold(maxWith((a, b) => a - b)),
			safe(nullable()),
			result(),
		)
		expect(res).toEqual(2)
	})
})

describe('max', () => {
	test('empty', () => {
		const res = flow(empty<number, void>(), fold(max()), result())
		expect(res).toEqual(-Infinity)
	})
	test('defined', () => {
		const res = flow(iterable([0, 2, 1]), fold(max()), result())
		expect(res).toEqual(2)
	})
})

describe('min', () => {
	test('empty', () => {
		const res = flow(empty<number, void>(), fold(min()), result())
		expect(res).toEqual(+Infinity)
	})
	test('defined', () => {
		const res = flow(iterable([1, 0, 2]), fold(min()), result())
		expect(res).toEqual(0)
	})
})

describe('sort', () => {
	test('', () => {
		const res = flow(iterable([0, 2, 2, 1]), fold(sort()), result())
		expect(res).toEqual([0, 1, 2])
	})
})

describe('shuffle', () => {
	test('', () => {
		let res: number[]
		do {
			res = flow(iterable([0, 1, 2, 3]), fold(shuffle()), result())
		} while (shallowEqual(res, [0, 1, 2, 3]))
		expect(res).not.equal([0, 1, 2, 3])
		res.sort((a, b) => a - b)
		expect(res).toEqual([0, 1, 2, 3])
	})
})
