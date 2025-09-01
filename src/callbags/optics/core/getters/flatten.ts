import type { Source } from '../core/types'
import type { _OpticArg } from '../core/types'

import { _compo } from '../core/compose'
import { sequence } from './sequence'

export function flatten<A, E>() {
	return sequence<A, Source<A, E>, E>((source) => (next, e, c) => {
		const unmounts = new Set<() => void>()
		// whether the source of sources is done
		let done = false
		const { start, unmount } = source(
			(source) => {
				const { start, unmount } = source(
					(value) => {
						// this is for lazy resolution
						next(value)
					},
					e,
					() => {
						unmount()
						unmounts.delete(unmount)
						if (unmounts.size === 0 && done) c()
					},
				)
				unmounts.add(unmount)
				start()
			},
			e,
			() => {
				done = true
				if (!unmounts.size) c()
			},
		)
		return {
			start,
			unmount() {
				unmounts.forEach((cb) => cb())
				unmount()
			},
		}
	})
}
