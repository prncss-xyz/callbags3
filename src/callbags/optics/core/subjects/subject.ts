import type { Source } from '../core/types'

// hot observable
export function subject<S, ES>(source: Source<S, ES>) {
	let id = 0
	let count = 0
	const subs = new Map<
		number,
		{
			complete: () => void
			error: (e: ES) => void
			next: (s: S) => void
		}
	>()
	return function (): Source<S, ES> {
		const { start, unmount } = source(
			(s) => subs.forEach(({ next }) => next(s)),
			(e) => subs.forEach(({ error }) => error(e)),
			() => subs.forEach(({ complete }) => complete()),
		)
		return function (next, error, complete) {
			const _id = id++
			return {
				start: () => {
					subs.set(_id, {
						complete,
						error,
						next,
					})
					if (count === 0) start()
					count++
				},
				unmount: () => {
					subs.delete(_id)
					count--
					if (count === 0) setTimeout(() => count === 0 && unmount(), 0)
				},
			}
		}
	}
}
