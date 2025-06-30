import { isoAssert } from '@prncss-xyz/utils'

import { directMachine } from './direct'

const list0 = {
	currentId: 0,
	items: [{ duration: 0, id: 0 }],
	nextId: 1,
}
type State = typeof list0

function move(offset: number) {
	return function (_: void, { currentId, items }: State) {
		let index = items.findIndex((t) => t.id === currentId)
		isoAssert(index !== -1, 'current item should always exist')
		index = (index + offset + items.length) % items.length
		return { currentId: items[index].id! }
	}
}

function getItem<Id, Item>(id: Id, items: (Item & { id: Id })[]) {
	const item = items.find((t) => t.id === id)
	isoAssert(item, 'current item should always exist')
	return item
}

export const playlist = directMachine()(
	list0,
	{
		duplicate: ({ id }: { id: number }, { items, nextId }) => ({
			items: [...items, { ...getItem(id, items), id: nextId }],
			nextId: nextId + 1,
		}),
		next: move(1),
		previous: move(-1),
		remove: ({ id }: { id: number }, { items }) => ({
			items: items.filter((t) => t.id !== id),
		}),
		resetPlaylist: () => list0,
		select: ({ id }: { id: number }) => ({ currentId: id }),
		update: (
			{ duration, id }: { duration: number; id: number },
			{ items },
		) => ({
			items: items.map((t) => (t.id === id ? { ...t, duration } : t)),
		}),
	},
	{
		select: ({ currentId, items }) => {
			const item = items.find((t) => t.id === currentId)
			isoAssert(item, 'current item should always exist')
			return {
				currentDuration: item.duration,
				currentId,
				items,
			}
		},
	},
)

export const { getResult, init, send } = playlist
