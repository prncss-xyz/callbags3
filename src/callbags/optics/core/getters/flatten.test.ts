import { flow } from '@constellar/core'

import { eq } from '../core/eq'
import { collect, collectAsync } from '../extractors/collect'
import { interval } from '../sources/async/interval'
import { range } from '../sources/sync/loop'
import { flatten } from './flatten'
import { map } from './map'
import { take } from './take'

describe('flatten', () => {
	it('sync', () => {
		const o = flow(
			eq<number>(),
			map((i) => range(0, i)),
			flatten(),
		)
		const res = collect(o)(range(1, 4))
		expect(res).toEqual([0, 0, 1, 0, 1, 2])
	})
	it('async', async () => {
		const o = flow(
			eq<number>(),
			map((i) => interval((i + 1) * 4)),
			flatten(),
			take(6),
		)
		const res = await collectAsync(o)(interval(6))
		expect(res).toEqual([0, 1, 2, 0, 3, 4])
	})
})
