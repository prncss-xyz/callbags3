import { flow } from '@constellar/core'

import { eq } from '../core/eq'
import { update } from '../extractors/update'
import { view } from '../extractors/view'
import { rewrite } from './rewrite'

describe('rewrite', () => {
	const o = flow(
		eq<string>(),
		rewrite((s) => s.toUpperCase()),
	)
	it('view', () => {
		expect(view(o)('foo')).toBe('foo')
	})
	it('update', () => {
		expect(update(o)('foo')('')).toBe('FOO')
	})
})
