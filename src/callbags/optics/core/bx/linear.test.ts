import { flow } from '@constellar/core'

import { eq } from '../core/eq'
import { update } from '../extractors/update'
import { view } from '../extractors/view'
import { linear } from './linear'

describe('linear', () => {
	const o = flow(eq<number>(), linear(1.8, 32))
	it('celsius to fahrenheit', () => {
		expect(view(o)(-40)).toBe(-40)
		expect(view(o)(100)).toBe(212)
	})
	it('fahrenheit to celsius', () => {
		expect(update(o)(-40)(0)).toBe(-40)
		expect(update(o)(212)(0)).toBe(100)
	})
})
