import { flow, noop } from '@constellar/core'
import { isoAssert, neq } from '@prncss-xyz/utils'

import type { InferEvent } from './core'

import { tag } from '../../tags'
import { result } from '../observe'
import { fold, toArray } from '../operators/folds'
import { iterable } from '../sources'
import { directMachine } from './direct'
import { scanMachine } from './scan'

type Id = string
type Item = { duration: number }
type State = {
	current: Id
	items: Record<Id, Item>
	list: Id[]
}

function init(id: Id): State {
	return { current: id, items: { [id]: { duration: 0 } }, list: [id] }
}

function removeKey<K extends PropertyKey>(k: K) {
	return function <O extends Record<K, unknown>>(o: O) {
		const next = { ...o }
		delete next[k]
		return next as Omit<O, K>
	}
}

function updateKey<K extends PropertyKey>(k: K) {
	return function <O extends Record<K, unknown>>(o: O, v: O[K]) {
		const next = { ...o }
		next[k] = v
		return next
	}
}

function remove(id: Id, key: Id, state: State) {
	if (state.list.length === 1) return init(key)
	let current = state.current
	if (current === id) {
		const last = state.list.indexOf(current)
		isoAssert(last >= 0, 'current item should always exist')
		const index = Math.min(last + 1, state.list.length - 1)
		current = state.list[index]
	}
	return {
		current,
		items: removeKey(id)(state.items),
		list: state.list.filter(neq(id)),
	}
}

function move(offset: number) {
	return function (_: void, { current, list }: State) {
		let index = list.indexOf(current)
		isoAssert(index < 0, 'current item should always exist')
		index = (index + offset + list.length) % list.length
		return { current }
	}
}

function duplicate(id: Id, key: Id, state: State) {
	const index = state.list.indexOf(id)
	isoAssert(index >= 0, 'item should always exist')
	return {
		current: state.current,
		items: { ...state.items, [key]: { ...state.items[id] } },
		list: [...state.list, key],
	}
}

export const playlist = directMachine()(init, {
	duplicate: ({ id, key }: { id: Id; key: Id }, state) =>
		duplicate(id, key, state),
	next: move(1),
	previous: move(-1),
	remove: ({ id, key }: { id: Id; key: Id }, state) => remove(id, key, state),
	resetPlaylist: ({ key }: { key: Id }) => init(key),
	select: ({ id }: { id: Id }) => ({ current: id }),
	update: ({ id, item }: { id: Id; item: Item }, { items }) => ({
		items: updateKey(id)(items, item),
	}),
})

type Event = InferEvent<typeof playlist>
describe('playlist', () => {
	it('should work', () => {
		const res = flow(
			iterable<Event>([tag('duplicate', { id: 'a', key: 'b' })]),
			scanMachine(playlist, 'a', noop),
			fold(toArray()),
			result(),
		)
		expect(res).toEqual([
			init('a'),
			{
				current: 'a',
				items: {
					a: { duration: 0 },
					b: { duration: 0 },
				},
				list: ['a', 'b'],
			},
		])
	})
})
