import { focus } from '../core/focus'
import { update, view } from '../extractors'
import { dedupe } from './dedupe'

describe('dedupe', () => {
	const equal = (a: string, b: string) => a.toUpperCase() === b.toUpperCase()
	const o = focus<string>()(dedupe(equal))
	it('view', () => {
		expect(view(o)('foo')).toBe('foo')
		expect(view(o)('FOO')).toBe('FOO')
	})
	it('put', () => {
		expect(update(o)('foo')('bar')).toBe('foo')
		expect(update(o)('foo')('FOO')).toBe('FOO')
	})
})
