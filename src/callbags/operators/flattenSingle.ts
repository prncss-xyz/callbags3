import { pipe } from '@constellar/core'

import type { AnyMulti, AnyPull, SingleSource, Source } from '../sources/core'

import { map } from './map'

export function flattenSingle<
	A,
	EI,
	EO,
	P extends AnyPull,
	M extends AnyMulti,
>() {
	return function (
		source: Source<Source<A, EO, P, M>, EI, P, undefined>,
	): Source<A, EI | EO, P, M> {
		return function (props) {
			let u: () => void
			const { pull, unmount } = source({
				complete: undefined,
				error: props.error,
				next(s) {
					const { pull, unmount } = s({
						complete: props.complete,
						error(err) {
							props.error(err)
						},
						next(value) {
							props.next(value)
						},
					})
					u = unmount
					pull?.()
				},
			})
			return {
				pull,
				unmount() {
					u?.()
					unmount()
				},
			}
		}
	}
}

export function chainSingle<VS, VT, ET, P extends AnyPull>(
	cb: (A: VS) => SingleSource<VT, ET, P>,
) {
	return pipe(
		map<VS, SingleSource<VT, ET, P>, P, undefined, ET>(cb),
		flattenSingle(),
	)
}
