import { pipe } from '@constellar/core'
import { thrush } from '@prncss-xyz/utils'

import { type AnyPull, type Multi, type MultiSource } from '../sources'
import { map } from './map'

// TODO: not just MultiSource

export function flattenMulti<Value, Context, EO, EI, P extends AnyPull>() {
	return function (
		sources: MultiSource<MultiSource<Value, Context, EI, P>, Context, EO, P>,
	): MultiSource<Value, Context, EI | EO, P> {
		return function ({ complete, context, error, next }) {
			const unmounts = new Set<() => void>()
			// whether the source of sources is done
			let done = false
			const { pull, unmount } = sources({
				complete() {
					done = true
					if (unmounts.size === 0) complete()
				},
				context,
				error,
				next(source) {
					const { pull, unmount } = source({
						complete() {
							unmount()
							unmounts.delete(unmount)
							if (unmounts.size === 0 && done) complete()
						},
						context,
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

export function chainMulti<VS, VT, Context, ET, P extends AnyPull>(
	cb: (A: VS, context: Context) => MultiSource<VT, Context, ET, P>,
) {
	return pipe(
		map<VS, MultiSource<VT, Context, ET, P>, Context, P, Multi, ET>(cb),
		flattenMulti(),
	)
}
