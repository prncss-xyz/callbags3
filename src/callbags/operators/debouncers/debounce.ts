import type { Multi, Source } from '../../sources/core'

export function debounce<A, Context>(delay: number) {
	return function <Err>(
		source: Source<A, Context, Err, undefined, Multi>,
	): Source<A, Context, Err, undefined, Multi> {
		return function (props) {
			let handle: NodeJS.Timeout | number = 0
			let arg_: A
			function eff() {
				props.next(arg_)
			}
			return source({
				...props,
				complete() {
					if (handle) {
						clearTimeout(handle)
						eff()
						props.complete()
					}
				},
				error(err) {
					clearTimeout(handle)
					props.error(err)
				},
				next(value) {
					clearTimeout(handle)
					arg_ = value
					handle = setTimeout(eff, delay)
				},
			})
		}
	}
}
