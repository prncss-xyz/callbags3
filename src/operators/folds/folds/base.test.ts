import { flow } from '@constellar/core'
import { extract } from '../../../observe/extract'
import { iterable } from '../../../sources/pull'
import { fold } from '../fold'
import { last } from './base'
import { opt } from '../../../errables/opt'

describe('last', () => {
	test('defined', () => {
		const v = flow(iterable([1, 2, 3]), fold(last()), extract(opt()))

		expect(v).toBe(3)
	})
	test('undefined', () => {
		const v = flow(iterable([]), fold(last()), extract(opt()))
		expect(v).toBe(undefined)
	})
})
