import type { Multi, Source } from '../../sources/core'

export function throttle<A, Context>(delay: number) {
	return function <Err>(
		source: Source<A, Context, Err, undefined, Multi>,
	): Source<A, Context, Err, undefined, Multi> {
		return function (props) {
			let last = 0
			return source({
				...props,
				next(value) {
					const now = Date.now()
					if (now - last > delay) {
						last = now
						props.next(value)
					}
				},
			})
		}
	}
}
