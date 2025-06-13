import { flow } from '@constellar/core'
import { iterable } from '../../../sources/pull'
import { fold } from '../fold'
import { last } from './base'
import { nullable } from '../../../errables/nullable'
import { safe } from '../../safe'
import { result } from '../../../observe'

describe('last', () => {
	test('defined', () => {
		const v = flow(
			iterable([1, 2, 3]),
			fold(last()),
			safe(nullable()),
			result(),
		)
		expect(v).toBe(3)
	})
	test('undefined', () => {
		const v = flow(iterable([]), fold(last()), safe(nullable()), result())
		expect(v).toBe(undefined)
	})
})
