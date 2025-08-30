import { flow } from '@constellar/core'

import { eq } from '../core/eq'
import { update, view } from '../extractors'
import { map } from './map'

describe('map', () => {
	const o = flow(
		eq<string>(),
		map((s) => s.length),
	)
	it('view', () => {
		expect(view(o)('toto')).toBe(4)
	})

	// @ts-expect-error update must fail with a getter
	update(o)

	expect(() => {
		// @ts-expect-error review must fail with a getter
		review(o)
	}).toThrow()
})
