import type { AnyMulti, AnyPull, SingleSource, Source } from '../sources/core'
import { pipe } from '@constellar/core'
import { map } from './map'

export function flattenSingle<
	A,
	Context,
	EI,
	EO,
	P extends AnyPull,
	M extends AnyMulti,
>() {
	return function (
		source: Source<Source<A, Context, EO, P, M>, Context, EI, P, undefined>,
	): Source<A, Context, EI | EO, P, M> {
		return function (props) {
			let u: () => void
			const { pull, unmount } = source({
				context: props.context,
				complete: undefined,
				error: props.error,
				next(s) {
					const { pull, unmount } = s({
						context: props.context,
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

export function chainSingle<VS, VT, Context, ET, P extends AnyPull>(
	cb: (A: VS, index: Context) => SingleSource<VT, Context, ET, P>,
) {
	return pipe(
		map<VS, SingleSource<VT, Context, ET, P>, Context, P, undefined, ET>(cb),
		flattenSingle(),
	)
}
