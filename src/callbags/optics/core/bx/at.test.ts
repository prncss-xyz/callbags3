import { flow } from '@constellar/core'

import { succ } from '../../../../errors/either'
import { eq } from '../core/eq'
import { preview, REMOVE, update } from '../extractors'
import { at } from './at'

describe('at', () => {
	type S = number[]
	const o = flow(eq<S>(), at(1))
	it('view', () => {
		expect(preview(o)([1, 2, 3])).toEqual(succ.of(2))
	})
	it('put', () => {
		expect(update(o)(0)([1, 2, 3])).toEqual([1, 0, 3])
	})
	it('over', () => {
		expect(update(o)((x) => x + 1)([1, 2, 3])).toEqual([1, 3, 3])
	})
	it('remove', () => {
		expect(update(o)(REMOVE)([1, 2, 3])).toEqual([1, 3])
	})
})

describe('composed at', () => {
	type S = number[][]
	const o = flow(eq<S>(), at(1), at(2))
	it('view', () => {
		const res = preview(o)([
			[1, 2, 3],
			[4, 5, 6],
		])
		expect(res).toEqual(succ.of(6))
	})
	it('put', () => {
		const res = update(o)(0)([
			[1, 2, 3],
			[4, 5, 6],
		])
		expect(res).toEqual([
			[1, 2, 3],
			[4, 5, 0],
		])
	})
	it('over', () => {
		const res = update(o)((x) => x + 1)([
			[1, 2, 3],
			[4, 5, 6],
		])
		expect(res).toEqual([
			[1, 2, 3],
			[4, 5, 7],
		])
	})
	it('remove', () => {
		const res = update(o)(REMOVE)([
			[1, 2, 3],
			[4, 5, 6],
		])
		expect(res).toEqual([
			[1, 2, 3],
			[4, 5],
		])
	})
})
