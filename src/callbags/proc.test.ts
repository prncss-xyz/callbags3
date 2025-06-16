import { id, pipe } from '@constellar/core'
import { proc } from './proc'
import { fold, toArray } from './operators/folds'
import { interval, range } from './sources'
import { take } from './operators/filters'

async function* asyncRange(start: number, end: number) {
	for (let i = start; i < end; i++) {
		yield i
	}
}

describe('proc', () => {
	it('value', () => {
		const res = proc(3, id)
		expect(res).toBe(3)
		expectTypeOf(res).toEqualTypeOf<number>()
	})
	it('promise', async () => {
		const res = proc(Promise.resolve(3), id)
		expectTypeOf(res).toEqualTypeOf<Promise<number>>()
		expect(await res).toBe(3)
	})
	it('iterable', () => {
		const res = proc([1, 2], fold(toArray()))
		expect(res).toEqual([1, 2])
		expectTypeOf(res).toEqualTypeOf<number[]>()
	})
	it('async iterable', async () => {
		const res = proc(asyncRange(1, 4), fold(toArray()))
		expect(await res).toEqual([1, 2, 3])
		expectTypeOf(res).toEqualTypeOf<Promise<number[]>>()
	})
	it('source, sync', () => {
		const res = proc(range(0, 3), fold(toArray()))
		expect(res).toEqual([0, 1, 2])
		expectTypeOf(res).toEqualTypeOf<number[]>()
	})
	it('source, async', async () => {
		const res = proc(interval(10), pipe(take(3), fold(toArray())))
		expect(await res).toEqual([0, 1, 2])
		expectTypeOf(res).toEqualTypeOf<Promise<number[]>>()
	})
})
