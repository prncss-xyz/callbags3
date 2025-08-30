import { flow } from '@constellar/core'

import { eq } from '../core/eq'
import { update, view } from '../extractors'
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
