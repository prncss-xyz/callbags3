import { isoAssert } from '@prncss-xyz/utils'
import { simpleMachine } from './simple'

const list0 = {
	nextId: 1,
	currentId: 0,
	items: [{ id: 0, duration: 0 }],
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

function getItem<Id, Item>(id: Id, items: ({ id: Id } & Item)[]) {
	const item = items.find((t) => t.id === id)
	isoAssert(item, 'current item should always exist')
	return item
}

export const playlist = simpleMachine()(
	list0,
	{
		resetPlaylist: () => list0,
		select: ({ id }: { id: number }) => ({ currentId: id }),
		next: move(1),
		previous: move(-1),
		update: (
			{ id, duration }: { id: number; duration: number },
			{ items },
		) => ({
			items: items.map((t) => (t.id === id ? { ...t, duration } : t)),
		}),
		remove: ({ id }: { id: number }, { items }) => ({
			items: items.filter((t) => t.id !== id),
		}),
		duplicate: ({ id }: { id: number }, { items, nextId }) => ({
			nextId: nextId + 1,
			items: [...items, { ...getItem(id, items), id: nextId }],
		}),
	},
	{
		select: ({ items, currentId }) => {
			const item = items.find((t) => t.id === currentId)
			isoAssert(item, 'current item should always exist')
			return {
				items,
				currentDuration: item.duration,
				currentId,
			}
		},
	},
)

export const { init, send, getResult } = playlist
