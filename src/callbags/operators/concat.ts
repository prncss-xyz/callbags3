import { type AnyPull, type MultiSource, type Pull } from '../sources'
import { deferCond } from '../../utils'

export function concat<V1, Context, E1>(
	s2: MultiSource<V1, Context, E1, undefined>,
): <V2, E2>(
	s1: MultiSource<V2, Context, E2, undefined>,
) => MultiSource<V1 | V2, Context, E1 | E2, undefined>
export function concat<V1, Context, E1>(
	s2: MultiSource<V1, Context, E1, Pull>,
): <V2, Context, E2>(
	s1: MultiSource<V2, Context, E2, Pull>,
) => MultiSource<V1 | V2, Context, E1 | E2, Pull>
export function concat<V1, Context, E1, P extends AnyPull>(
	s2: MultiSource<V1, Context, E1, P>,
) {
	return function <V2, E2>(
		s1: MultiSource<V2, Context, E2, P>,
	): MultiSource<V1 | V2, Context, E1 | E2, P> {
		return function (props) {
			let unmount: () => void
			let async: boolean
			const ofS1 = s1({
				complete() {
					deferCond(async, () => {
						unmount()
						const ofS2 = s2(props)
						unmount = ofS2.unmount
						ofS2.pull?.()
					})
				},
				context: props.context,
				error: props.error,
				next: props.next,
			})
			async = Boolean(ofS1.pull)
			unmount = ofS1.unmount
			// this is for pull and unmount to be lazyily resolved
			return {
				pull: ofS1.pull,
				unmount() {
					unmount()
				},
			}
		}
	}
}
