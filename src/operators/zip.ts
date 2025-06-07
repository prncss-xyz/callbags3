import { type AnyPull, type MultiSource } from '../sources'

function merger<VL, VR, V, IL>(
	merge: (left: VL, right: VR, i: IL) => V,
	push: (c: V, i: IL) => void,
	complete: () => void,
) {
	let openedLeft = true
	let openedRight = true
	const ls: VL[] = []
	const is: IL[] = []
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
		nextLeft(l: VL, i: IL) {
			if (!openedLeft) return
			if (rs.length) {
				const r = rs.shift()!
				push(merge(l, r, i), i)
				if (!rs.length && !openedRight) complete()
				return
			}
			ls.push(l)
			is.push(i)
		},
		nextRight(r: VR) {
			if (!openedRight) return
			if (ls.length) {
				const a = ls.shift()!
				const i = is.shift()!
				push(merge(a, r, i), i)
				if (!ls.length && !openedLeft) complete()
				return
			}
			rs.push(r)
		},
	}
}

export function zip<VR, IR, ER, V, VL, P extends AnyPull>(
	sourceRight: MultiSource<VR, IR, ER, P>,
	merge: (a: VL, b: VR) => V,
) {
	return function <IL, EL>(
		sourceLeft: MultiSource<VL, IL, EL, P>,
	): MultiSource<V, IL, EL | ER, P> {
		return function ({ complete, error, next }) {
			const { completeLeft, completeRight, nextLeft, nextRight } = merger(
				merge,
				next,
				complete,
			)
			const ofSL = sourceLeft({ complete: completeLeft, error, next: nextLeft })
			const ofSR = sourceRight({
				complete: completeRight,
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
