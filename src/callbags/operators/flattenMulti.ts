import { pipe } from '@constellar/core'
import { thrush } from '@prncss-xyz/utils'

import { type AnyPull, type Multi, type MultiSource } from '../sources'
import { map } from './map'

// TODO: not just MultiSource

export function flattenMulti<Value, EO, EI, P extends AnyPull>() {
	return function (
		sources: MultiSource<MultiSource<Value, EI, P>, EO, P>,
	): MultiSource<Value, EI | EO, P> {
		return function ({ complete, error, next }) {
			const unmounts = new Set<() => void>()
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
							next(value)
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

export function chainMulti<VS, VT, ET, P extends AnyPull>(
	cb: (A: VS) => MultiSource<VT, ET, P>,
) {
	return pipe(map<VS, MultiSource<VT, ET, P>, P, Multi, ET>(cb), flattenMulti())
}
