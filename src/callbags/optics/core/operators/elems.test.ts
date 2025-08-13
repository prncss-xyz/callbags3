import { pipe } from '@constellar/core'

import { succ } from '../../../../errors'
import { preview, update, view } from '../extractors'
import { elems, type Elems } from './elems'
import { filter } from './filter'
import { focus } from './focus'
import { fold } from './fold'

function inArray<Value>(): Elems<Value[], Value, Value[]> {
	return {
		emitter: (next, _error, complete) => (acc) => {
			let done = false
			return {
				start: () => {
					for (const t of acc) {
						if (done) break
						next(t)
					}
					complete()
				},
				unmount: () => {
					done = true
				},
			}
		},
		fold: (t, acc) => [...acc, t],
		init: () => [],
	}
}

describe('elems', () => {
	const o = focus<number[]>()(elems(inArray()))
	it('view', () => {
		expect(preview(o)([1, 2, 3])).toEqual(succ.of(1))
	})
	it('modify', () => {
		expect(update(o)((x) => x * 2)([1, 2, 3])).toEqual([2, 4, 6])
	})
})
describe('compose', () => {
	const o = focus<number[]>()(
		pipe(
			elems(inArray()),
			filter((x) => x % 2 === 0),
		),
	)
	it('view', () => {
		expect(preview(o)([1, 2, 3])).toEqual(succ.of(2))
	})
	it('modify', () => {
		expect(update(o)((x) => x * 2)([1, 2, 3])).toEqual([1, 4, 3])
	})
})

describe('fold', () => {
	const o = focus<number[]>()(
		pipe(
			elems(inArray()),
			filter((x) => x % 2 === 0),
			fold(inArray()),
		),
	)
	it('view', () => {
		expect(view(o)([1, 2, 3])).toEqual([2])
	})
})
