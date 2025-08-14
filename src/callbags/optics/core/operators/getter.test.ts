import { update, view } from '../extractors'
import { focus } from './focus'
import { getter } from './getter'

describe('getter', () => {
	const o = focus<string>()(getter((s) => s.length))
	it('view', () => {
		expect(view(o)('toto')).toBe(4)
	})

  update(o)(3)

	// @ts-expect-error review must fail with a getter
	review(o)
})
