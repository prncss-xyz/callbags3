import type { AnyMulti, AnyPull, SingleSource, Source } from '../sources/core'
import { pipe } from '@constellar/core'
import { map } from './map'

export function flattenSingle<
	A,
	II,
	IO,
	EI,
	EO,
	P extends AnyPull,
	M extends AnyMulti,
>() {
	return function (
		source: Source<Source<A, IO, EO, P, M>, II, EI, P, undefined>,
	): Source<A, II, EI | EO, P, M> {
		return function (props) {
			let u: () => void
			const { pull, unmount } = source({
				complete: undefined,
				error: props.error,
				next(s, index) {
					const { pull, unmount } = s({
						complete: props.complete,
						error(err) {
							props.error(err)
						},
						next(value) {
							props.next(value, index)
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

export function chainSingle<VS, VT, IS, IT, ET, P extends AnyPull>(
	cb: (A: VS, index: IS) => SingleSource<VT, IT, ET, P>,
) {
	return pipe(
		map<VS, SingleSource<VT, IT, ET, P>, IS, P, undefined, ET>(cb),
		flattenSingle(),
	)
}
