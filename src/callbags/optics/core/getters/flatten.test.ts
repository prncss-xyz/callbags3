import { flow } from '@constellar/core'

import { inArray } from '../bx/traversal'
import { eq } from '../core/eq'
import { view, viewAsync } from '../extractors'
import { interval } from '../sources/interval'
import { range } from '../sources/loops'
import { flatten } from './flatten'
import { map } from './map'
import { fold } from './scan'
import { take } from './take'

describe('flatten', () => {
	it('sync', () => {
		const o = flow(
			eq<number>(),
			map((i) => range(0, i)),
			flatten(),
			fold(inArray()),
		)
		const res = view(o)(range(1, 4))
		expect(res).toEqual([0, 0, 1, 0, 1, 2])
	})
	it('async', async () => {
		const o = flow(
			eq<number>(),
			map((i) => interval((i + 1) * 4)),
			flatten(),
			take(6),
			fold(inArray()),
		)
		const res = await viewAsync(o)(interval(6))
		expect(res).toEqual([0, 1, 2, 0, 3, 4])
	})
})
