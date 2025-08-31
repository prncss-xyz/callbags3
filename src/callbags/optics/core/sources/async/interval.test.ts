import { flow } from '@constellar/core'
import { describe } from 'node:test'

import { eq } from '../../core/eq'
import { collectAsync } from '../../extractors/collect'
import { take } from '../../getters/take'
import { interval } from './interval'

describe('interval', () => {
	it('sums interval', async () => {
		const o = flow(eq<number>(), take(4))
		const res = await collectAsync(o)(interval(10))
		expect(res).toEqual([0, 1, 2, 3])
	})
})
