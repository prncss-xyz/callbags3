import { add } from '@prncss-xyz/utils'

import { eq } from '../../core/eq'
import { collect } from '../../extractors/collect'
import { until } from './until'

const collector = collect(eq<number>())

describe('until', () => {
	test('', () => {
		const res = collector(until(0, add(1), (x) => x === 3))
		expect(res).toEqual([1, 2, 3])
	})
})
