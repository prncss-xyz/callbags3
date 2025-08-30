import { flow } from '@constellar/core'

import { eq } from '../core/eq'
import { update, view } from '../extractors'
import { reread } from './reread'

describe('reread', () => {
	const o = flow(
		eq<string>(),
		reread((s) => s.toUpperCase()),
	)
	it('view', () => {
		expect(view(o)('foo')).toBe('FOO')
	})
	it('update', () => {
		// TODO: which behavior is better?
		expect(update(o)('')('foo')).toBe('')
		/* expect(update(focus)('')('foo')).toBe('foo') */
	})
})
