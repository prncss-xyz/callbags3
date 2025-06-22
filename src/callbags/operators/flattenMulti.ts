import { thrush } from '@prncss-xyz/utils'

import { type AnyPull, type Multi, type MultiSource } from '../sources'
import { pipe } from '@constellar/core'
import { map } from './map'

// TODO: not just MultiSource

export function flattenMulti<Value, Context, EO, EI, P extends AnyPull>() {
	return function (
		sources: MultiSource<MultiSource<Value, Context, EI, P>, Context, EO, P>,
	): MultiSource<Value, Context, EI | EO, P> {
		return function ({ complete, error, next, context }) {
			const unmounts = new Set<() => void>()
			// whether the source of sources is done
			let done = false
			const { pull, unmount } = sources({
				context,
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
						context,
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

export function chainMulti<VS, VT, Context, ET, P extends AnyPull>(
	cb: (A: VS, context: Context) => MultiSource<VT, Context, ET, P>,
) {
	return pipe(
		map<VS, MultiSource<VT, Context, ET, P>, Context, P, Multi, ET>(cb),
		flattenMulti(),
	)
}
