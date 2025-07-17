import type { AnyPull, Multi, Source } from '../../sources/core'

export function slices<Value, P extends AnyPull>(n: number) {
	return function <Err>(
		source: Source<Value, Err, P, Multi>,
	): Source<Value[], Err, P, Multi> {
		return function (props) {
			let acc: Value[] = []
			return source({
				...props,
				next(value) {
					acc.push(value)
					if (acc.length === n) {
						props.next(acc)
						acc = []
					}
				},
			})
		}
	}
}
