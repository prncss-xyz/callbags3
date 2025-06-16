import type { AnyPull, Multi, Source } from '../../sources/core'

export function window<Value, Index, P extends AnyPull>(n: number) {
	return function <Err>(
		source: Source<Value, Index, Err, P, Multi>,
	): Source<Value[], Index, Err, P, Multi> {
		return function (props) {
			let acc: Value[] = []
			return source({
				...props,
				next(value, index) {
					acc.push(value)
					if (acc.length === n) {
						props.next(acc, index)
						acc = acc.slice(1)
					}
				},
			})
		}
	}
}
