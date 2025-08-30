import { flow } from '@constellar/core'

import { err, succ } from '../../../../errors'
import { eq } from '../core/eq'
import { preview, REMOVE, update, view } from '../extractors'
import { prop } from './prop'

describe('prop', () => {
	type Source = {
		a: string
		b?: string
		c: null | string
	}
	const sourceDefined: Source = { a: 'A', b: 'B', c: 'C' }
	const sourceUndefined: Source = { a: 'A', c: null }
	const focusA = flow(eq<Source>(), prop('a'))
	const focusB = flow(eq<Source>(), prop('b'))
	const focusC = flow(eq<Source>(), prop('c'))

	it('view, preview', () => {
		// @ts-expect-error focusB is optional
		view(focusB)

		expect(view(focusA)(sourceDefined)).toBe('A')
		expect(view(focusA)(sourceUndefined)).toBe('A')
		expect(preview(focusB)(sourceDefined)).toEqual(succ.of('B'))
		expect(preview(focusB)(sourceUndefined)).toEqual(err.of('empty'))
		expect(preview(focusC)(sourceDefined)).toEqual(succ.of('C'))
		expect(preview(focusC)(sourceUndefined)).toEqual(err.of('empty'))
	})
	it('put', () => {
		expect(update(focusA)('C')(sourceDefined)).toEqual({
			a: 'C',
			b: 'B',
			c: 'C',
		})
		expect(update(focusA)('C')(sourceUndefined)).toEqual({ a: 'C', c: null })
		expect(update(focusB)('C')(sourceDefined)).toEqual({
			a: 'A',
			b: 'C',
			c: 'C',
		})
		expect(update(focusB)('C')(sourceUndefined)).toEqual({
			a: 'A',
			b: 'C',
			c: null,
		})
	})
	it('over', () => {
		const cb = (x: string) => `${x} UPDATED`
		expect(update(focusA)(cb)(sourceDefined)).toEqual({
			a: 'A UPDATED',
			b: 'B',
			c: 'C',
		})
		expect(update(focusB)(cb)(sourceUndefined)).toEqual({
			a: 'A',
			c: null,
		})
		expect(update(focusB)(cb)(sourceDefined)).toEqual({
			a: 'A',
			b: 'B UPDATED',
			c: 'C',
		})
		expect(update(focusB)(cb)(sourceUndefined)).toEqual({
			a: 'A',
			c: null,
		})
	})
	it('remove', () => {
		expect(update(focusB)(REMOVE)(sourceDefined)).toEqual({ a: 'A', c: 'C' })
		expect(update(focusB)(REMOVE)(sourceUndefined)).toEqual({ a: 'A', c: null })
		// @ts-expect-error focusA is not removable
		update(focusA)(REMOVE)
		// @ts-expect-error focusC is not removable
		update(focusC)(REMOVE)
	})
})
