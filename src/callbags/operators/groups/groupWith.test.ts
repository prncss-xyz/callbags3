import { flow } from '@constellar/core'

import { result } from '../../observe/result'
import { range } from '../../sources'
import { fold, toArray } from '../folds'
import { groupWith } from './groupWith'

function d(a: number) {
	return Math.floor(a / 3)
}

function eqm(a: number, b: number) {
	return d(a) === d(b)
}

describe('groupWith', () => {
	test('', () => {
		const res = flow(range(0, 7), groupWith(eqm), fold(toArray()), result())
		expect(res).toEqual([[0, 1, 2], [3, 4, 5], [6]])
	})
})
