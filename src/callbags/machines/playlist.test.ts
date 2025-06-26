import { isoAssert } from '@prncss-xyz/utils'
import { simpleMachine } from './simple'

const list0 = {
	nextId: 1,
	currentId: 0,
	items: [{ id: 0, duration: 0 }],
}

const playlist = simpleMachine()(
	list0,
	{
		select: ({ id }: { id: number }) => ({ currentId: id }),
		move: ({ offset }: { offset: number }, { currentId, items }) => {
			let index = items.findIndex((t) => t.id === currentId)
			isoAssert(index !== -1, 'current item should always exist')
			index = (index + offset) % items.length
			return { currentId: items[index].id! }
		},
		update: (
			{ id, duration }: { id: number; duration: number },
			{ items },
		) => ({
			items: items.map((t) => (t.id === id ? { ...t, duration } : t)),
		}),
		remove: ({ id }: { id: number }, { items }) => {
			if (items.length === 1) return list0
			const item = items.find((t) => t.id === id)
			isoAssert(item, 'current item should always exist')
			return { items: items.filter((t) => t.id !== id) }
		},
		duplicate: ({ id }: { id: number }, { items, nextId }) => {
			const item = items.find((t) => t.id === id)
			isoAssert(item, 'current item should always exist')
			const nextItem = { ...item, id: nextId }
			return {
				nextId: nextId + 1,
				items: [...items, nextItem],
			}
		},
	},
	{
		select: ({ items, currentId }) => {
			const item = items.find((t) => t.id === currentId)
			isoAssert(item, 'current item should always exist')
			return {
				currentDuration: item.duration,
				items: items.map(({ id, duration }) => ({
					id,
					duration,
					current: id === currentId,
				})),
			}
		},
	},
)

export const { init, send, getResult } = playlist
type R = ReturnType<typeof getResult>['value']
