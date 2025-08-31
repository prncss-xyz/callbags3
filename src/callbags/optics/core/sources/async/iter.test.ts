import { describe } from 'node:test'

import { eq } from '../../core/eq'
import { collectAsync } from '../../extractors/collect'
import { iterAsync } from './iter'

const asyncIterator = (async function* () {
	yield 0
	yield 1
	yield 2
})()

describe('interval', () => {
	it('sums interval', async () => {
		const o = eq<number>()
		const res = await collectAsync(o)(iterAsync(asyncIterator))
		expect(res).toEqual([0, 1, 2])
	})
})
