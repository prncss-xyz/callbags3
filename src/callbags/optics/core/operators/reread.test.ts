import { focus } from '../core/focus'
import { update, view } from '../extractors'
import { reread } from './reread'

describe('reread', () => {
	const o = focus<string>()(reread((s) => s.toUpperCase()))
	it('view', () => {
		expect(view(o)('foo')).toBe('FOO')
	})
	it('update', () => {
		// TODO: which behavior is better?
		expect(update(o)('')('foo')).toBe('')
		/* expect(update(focus)('')('foo')).toBe('foo') */
	})
})
