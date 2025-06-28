import { type AnyPull, type MultiSource } from '../sources'

function merger<VL, VR, V>(
	merge: (left: VL, right: VR) => V,
	push: (c: V) => void,
	complete: () => void,
) {
	let openedLeft = true
	let openedRight = true
	const ls: VL[] = []
	const rs: VR[] = []
	return {
		completeLeft() {
			if (openedRight) {
				openedLeft = false
				return
			}
			complete()
		},
		completeRight() {
			if (openedLeft) {
				openedRight = false
				return
			}
			complete()
		},
		nextLeft(l: VL) {
			if (!openedLeft) return
			if (rs.length) {
				const r = rs.shift()!
				push(merge(l, r))
				if (!rs.length && !openedRight) complete()
				return
			}
			ls.push(l)
		},
		nextRight(r: VR) {
			if (!openedRight) return
			if (ls.length) {
				const a = ls.shift()!
				push(merge(a, r))
				if (!ls.length && !openedLeft) complete()
				return
			}
			rs.push(r)
		},
	}
}

export function zip<VR, Context, ER, V, VL, P extends AnyPull>(
	sourceRight: MultiSource<VR, Context, ER, P>,
	merge: (a: VL, b: VR) => V,
) {
	return function <EL>(
		sourceLeft: MultiSource<VL, Context, EL, P>,
	): MultiSource<V, Context, EL | ER, P> {
		return function ({ complete, context, error, next }) {
			const { completeLeft, completeRight, nextLeft, nextRight } = merger(
				merge,
				next,
				complete,
			)
			const ofSL = sourceLeft({
				complete: completeLeft,
				context,
				error,
				next: nextLeft,
			})
			const ofSR = sourceRight({
				complete: completeRight,
				context,
				error,
				next: nextRight,
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
