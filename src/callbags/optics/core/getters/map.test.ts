import { flow } from '@constellar/core'

import { eq } from '../core/eq'
import { review } from '../extractors/review'
import { update } from '../extractors/update'
import { view } from '../extractors/view'
import { map } from './map'

describe('map', () => {
	const o = flow(
		eq<string>(),
		map((s) => s.length),
	)
	it('view', () => {
		expect(view(o)('toto')).toBe(4)
	})

	// @ts-expect-error must fail with a getter
	update(o)

	expect(() => {
		// @ts-expect-error must fail with a getter
		review(o)
	}).toThrow()
})
