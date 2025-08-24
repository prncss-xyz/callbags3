import { focus } from '../core/focus'
import { update, view } from '../extractors'
import { map } from './map'

describe('map', () => {
	const o = focus<string>()(map((s) => s.length))
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
