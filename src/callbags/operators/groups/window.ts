import type { AnyPull, Multi, Source } from '../../sources/core'

export function window<Value, Context, P extends AnyPull>(n: number) {
	return function <Err>(
		source: Source<Value, Context, Err, P, Multi>,
	): Source<Value[], Context, Err, P, Multi> {
		return function (props) {
			let acc: Value[] = []
			return source({
				...props,
				next(value) {
					acc.push(value)
					if (acc.length === n) {
						props.next(acc)
						acc = acc.slice(1)
					}
				},
			})
		}
	}
}
