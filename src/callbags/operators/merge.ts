import { type InferGuard, isUnknown } from '../../guards'
import { union } from '../../tags/unions'
import { type AnyPull, type MultiSource } from '../sources'

export const [isEither, { left, right }] = union({
	left: isUnknown,
	right: isUnknown,
})

type Left<S> = InferGuard<typeof left.is<S>>
type Right<S> = InferGuard<typeof right.is<S>>

export function merge<VR, ER, VL, P extends AnyPull>(
	sourceRight: MultiSource<VR, ER, P>,
) {
	return function <EL>(
		sourceLeft: MultiSource<VL, EL, P>,
	): MultiSource<Left<VL> | Right<VR>, EL | ER, P> {
		return function ({ complete, error, next }) {
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
