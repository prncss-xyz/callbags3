import type { Multi, Source } from '../../sources/core'

export function throttle<A, Index>(delay: number) {
	return function <Err>(
		source: Source<A, Index, Err, undefined, Multi>,
	): Source<A, Index, Err, undefined, Multi> {
		return function (props) {
			let last = 0
			return source({
				...props,
				next(value, index) {
					const now = Date.now()
					if (now - last > delay) {
						last = now
						props.next(value, index)
					}
				},
			})
		}
	}
}
