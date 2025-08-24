import { err, succ } from '../../../../errors/either'
import { focus } from '../core/focus'
import { preview, REMOVE, update } from '../extractors'
import { findOne } from './findOne'

describe('findOne', () => {
	type Source = { bar: string }
	const sourceDefined: Source[] = [
		{ bar: 'baz' },
		{ bar: 'quux' },
		{ bar: 'xx' },
	]
	const sourceUndefined: Source[] = [
		{ bar: 'baz' },
		{ bar: 'nomatch' },
		{ bar: 'xx' },
	]
	const o = focus<Source[]>()(findOne((item) => item.bar === 'quux'))
	describe('view', () => {
		it('defined', () => {
			expect(preview(o)(sourceDefined)).toEqual(succ.of({ bar: 'quux' }))
		})
		it('undefined', () => {
			expect(preview(o)(sourceUndefined)).toEqual(err.of('empty'))
		})
	})
	describe('put', () => {
		it('defined', () => {
			expect(update(o)({ bar: 'UPDATED' })(sourceDefined)).toEqual([
				{ bar: 'baz' },
				{ bar: 'UPDATED' },
				{ bar: 'xx' },
			])
		})
		it('undefined', () => {
			expect(update(o)({ bar: 'UPDATED' })(sourceUndefined)).toEqual([
				{ bar: 'baz' },
				{ bar: 'nomatch' },
				{ bar: 'xx' },
				{ bar: 'UPDATED' },
			])
		})
	})
	describe('modify', () => {
		it('defined', () => {
			expect(
				update(o)((x) => ({
					bar: `${x.bar} UPDATED`,
				}))(sourceDefined),
			).toEqual([{ bar: 'baz' }, { bar: 'quux UPDATED' }, { bar: 'xx' }])
		})
		it('undefined', () => {
			expect(
				update(o)((x) => ({
					bar: `${x.bar} UPDATED`,
				}))(sourceUndefined),
			).toEqual(sourceUndefined)
		})
	})
	describe('remove', () => {
		it('defined', () => {
			expect(update(o)(REMOVE)(sourceDefined)).toEqual([
				{ bar: 'baz' },
				{ bar: 'xx' },
			])
		})
		it('undefined', () => {
			expect(update(o)(REMOVE)(sourceUndefined)).toEqual(sourceUndefined)
		})
	})
	test('refine type', () => {
		type T = number | string
		const o = focus<T[]>()(findOne((item) => typeof item === 'string'))
		const source: T[] = []
		const res = preview(o)(source)
		// TODO:
	})
})
