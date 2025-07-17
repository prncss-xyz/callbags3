import { flow } from '@constellar/core'

import { result } from '../../../observe/result'
import { empty, iterable } from '../../../sources/pull'
import { fold } from '../fold'
import { wordCount } from './wordCount'

describe('isWordLike', () => {
	test('empty', () => {
		const res = flow(empty<string>(), fold(wordCount()), result())
		expect(res).toBe(0)
	})
	test('defined', () => {
		const res = flow(iterable(' hello  world '), fold(wordCount()), result())
		expect(res).toEqual(2)
	})
})
