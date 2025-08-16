import { focus } from '../core/focus'
import { update, view } from '../extractors'
import { getter } from './getter'

describe('getter', () => {
	const o = focus<string>()(getter((s) => s.length))
	it('view', () => {
		expect(view(o)('toto')).toBe(4)
	})

	// @ts-expect-error update must fail with a getter
	update(o)(3)

	// @ts-expect-error review must fail with a getter
	review(o)
})
