import { type InferGuard, isUnknown } from '../../guards'
import { union } from '../../tags/unions'
import { type AnyPull, type MultiSource } from '../sources'

export const [isEither, { left, right }] = union({
	left: isUnknown,
	right: isUnknown,
})

type Left<S> = InferGuard<typeof left.is<S>>
type Right<S> = InferGuard<typeof right.is<S>>

export function merge<VR, Context, ER, VL, P extends AnyPull>(
	sourceRight: MultiSource<VR, Context, ER, P>,
) {
	return function <EL>(
		sourceLeft: MultiSource<VL, Context, EL, P>,
	): MultiSource<Left<VL> | Right<VR>, Context | Context, EL | ER, P> {
		return function ({ complete, context, error, next }) {
			let openedLeft = true
			let openedRight = true
			const ofSL = sourceLeft({
				complete() {
					if (openedRight) {
						openedLeft = false
						return
					}
					complete()
				},
				context,
				error,
				next(v) {
					next(left.of(v))
				},
			})
			const ofSR = sourceRight({
				complete() {
					if (openedLeft) {
						openedRight = false
						return
					}
					complete()
				},
				context,
				error,
				next(v) {
					next(right.of(v))
				},
			})
			return {
				pull: (ofSL.pull || ofSR.pull
					? () => {
							ofSL.pull?.()
							ofSR.pull?.()
						}
					: undefined) as any,
				unmount() {
					ofSL.unmount()
					ofSR.unmount()
				},
			}
		}
	}
}
