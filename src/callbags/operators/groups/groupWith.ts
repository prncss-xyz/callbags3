import type { AnyPull, Multi, Source } from '../../sources/core'

export function groupWith<Value, Context, P extends AnyPull>(
	eq: (next: Value, last: Value) => unknown,
) {
	return function <Err>(
		source: Source<Value, Context, Err, P, Multi>,
	): Source<Value[], Context, Err, P, Multi> {
		return function (props) {
			let last: Value
			let acc: Value[] = []
			return source({
				...props,
				complete() {
					if (acc.length > 0) props.next(acc)
					props.complete()
				},
				next(value) {
					if (acc.length === 0) {
						acc.push(value)
					} else if (eq(value, last!)) {
						acc.push(value)
					} else {
						props.next(acc)
						acc = [value]
					}
					last = value
				},
			})
		}
	}
}
