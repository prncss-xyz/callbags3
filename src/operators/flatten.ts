import { thrush } from '@prncss-xyz/utils'

import { type AnyPull, type MultiSource } from '../sources'

export function flatten<Value, IO, EO, II, EI, P extends AnyPull>() {
	return function (
		sources: MultiSource<MultiSource<Value, II, EI, P>, IO, EO, P>,
	): MultiSource<Value, IO, EI | EO, P> {
		return function ({ complete, error, next }) {
			const unmounts = new Set<() => void>()
			let index: IO
			// whether the source of sources is done
			let done = false
			const { pull, unmount } = sources({
				complete() {
					done = true
					if (unmounts.size === 0) complete()
				},
				error,
				next(source) {
					const { pull, unmount } = source({
						complete() {
							unmount()
							unmounts.delete(unmount)
							if (unmounts.size === 0 && done) complete()
						},
						error,
						next(value) {
              // this is for lazy resolution
							next(value, index!)
						},
					})
					unmounts.add(unmount)
					pull?.()
				},
			})
			return {
				pull,
				unmount() {
					unmounts.forEach(thrush)
					unmount()
				},
			}
		}
	}
}
