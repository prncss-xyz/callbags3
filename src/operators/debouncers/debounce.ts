import type { Multi, Source } from '../../sources/core'

export function debounce<A, Index>(delay: number) {
	return function <Err>(
		source: Source<A, Index, Err, undefined, Multi>,
	): Source<A, Index, Err, undefined, Multi> {
		return function (props) {
			let handle: NodeJS.Timeout | number = 0
			let arg_: A
			let index_: Index
			function eff() {
				props.next(arg_, index_)
			}
			return source({
				...props,
				next(value, index) {
					clearTimeout(handle)
					arg_ = value
					index_ = index
					handle = setTimeout(eff, delay)
				},
				error(err) {
					clearTimeout(handle)
					props.error(err)
				},
				complete() {
					if (handle) {
						clearTimeout(handle)
						eff()
						props.complete()
					}
				},
			})
		}
	}
}
