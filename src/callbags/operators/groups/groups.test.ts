import { flow } from '@constellar/core'
import { range } from '../../sources'
import { fold, toArray } from '../folds'
import { result } from '../../observe/result'
import { groups } from './groups'

function d(a: number) {
	return Math.floor(a / 3)
}

function eqm(a: number, b: number) {
	return d(a) === d(b)
}

describe('groups', () => {
	test('', () => {
		const res = flow(range(0, 7), groups(eqm), fold(toArray()), result())
		expect(res).toEqual([[0, 1, 2], [3, 4, 5], [6]])
	})
})
