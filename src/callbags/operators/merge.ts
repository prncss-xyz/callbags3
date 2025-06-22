import { isUnknown, type InferGuard } from '../../guards'
import { type AnyPull, type MultiSource } from '../sources'
import { union } from '../../unions'

const LR = Symbol('LR')
export const [isEither, { left, right }] = union(LR, {
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
		return function ({ context, complete, error, next }) {
			let openedLeft = true
			let openedRight = true
			const ofSL = sourceLeft({
				context,
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
				context,
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
