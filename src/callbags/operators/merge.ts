import { isUnknown, type Guarded } from '../../guards'
import { type AnyPull, type MultiSource } from '../sources'
import { union } from '../../unions'

const LR = Symbol('LR')
export const [isEither, { left, right }] = union(LR, {
	left: isUnknown,
	right: isUnknown,
})

type Left<S> = Guarded<typeof left.is<S>>
type Right<S> = Guarded<typeof right.is<S>>

export function merge<VR, IR, ER, VL, P extends AnyPull>(
	sourceRight: MultiSource<VR, IR, ER, P>,
) {
	return function <IL, EL>(
		sourceLeft: MultiSource<VL, IL, EL, P>,
	): MultiSource<Left<VL> | Right<VR>, IL | IR, EL | ER, P> {
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
				next(v, i) {
					next(left.of(v), i)
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
				next(v, i) {
					next(right.of(v), i)
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
