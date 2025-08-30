import { focus } from '../core/focus'
import { update, view } from '../extractors'
import { rewrite } from './rewrite'

describe('rewrite', () => {
	const o = focus<string>()(rewrite((s) => s.toUpperCase()))
	it('view', () => {
		expect(view(o)('foo')).toBe('foo')
	})
	it('update', () => {
		expect(update(o)('foo')('')).toBe('FOO')
	})
})
