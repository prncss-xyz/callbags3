import { thrush } from '@prncss-xyz/utils'

import { type AnyPull, type Multi, type MultiSource } from '../sources'
import { pipe } from '@constellar/core'
import { map } from './map'

// TODO: not just MultiSource

export function flattenMulti<Value, IO, EO, II, EI, P extends AnyPull>() {
	return function (
		sources: MultiSource<MultiSource<Value, II, EI, P>, IO, EO, P>,
	): MultiSource<Value, IO, EI | EO, P> {
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
				next(source, index) {
					const { pull, unmount } = source({
						complete() {
							unmount()
							unmounts.delete(unmount)
							if (unmounts.size === 0 && done) complete()
						},
						error,
						next(value) {
							// this is for lazy resolution
							next(value, index)
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

export function chainMulti<VS, VT, IS, IT, ET, P extends AnyPull>(
	cb: (A: VS, index: IS) => MultiSource<VT, IT, ET, P>,
) {
	return pipe(
		map<VS, MultiSource<VT, IT, ET, P>, IS, P, Multi, ET>(cb),
		flattenMulti(),
	)
}
