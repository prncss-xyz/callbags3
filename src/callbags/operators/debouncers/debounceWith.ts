import type { Multi, Source } from '../../sources/core'

export function debounceWith<A>(
	delay: number,
	eq: (next: A, last: A) => unknown = Object.is,
) {
	return function <Err>(
		source: Source<A, Err, undefined, Multi>,
	): Source<A, Err, undefined, Multi> {
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
					if (!eq(value, arg_)) props.next(arg_)
					else {
						arg_ = value
						handle = setTimeout(eff, delay)
					}
				},
			})
		}
	}
}
