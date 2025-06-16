import type { AnyPull, Multi, Source } from '../../sources/core'

export function groups<Value, Index, P extends AnyPull>(
	eq: (next: Value, last: Value, index: Index) => unknown,
) {
	return function <Err>(
		source: Source<Value, Index, Err, P, Multi>,
	): Source<Value[], Index, Err, P, Multi> {
		return function (props) {
			let last: Value
			let firstIndex: Index
			let acc: Value[] = []
			return source({
				...props,
				complete() {
					if (acc.length > 0) props.next(acc, firstIndex)
					props.complete()
				},
				next(value, index) {
					if (acc.length === 0) {
						firstIndex = index
						acc.push(value)
					} else if (eq(value, last!, index)) {
						acc.push(value)
					} else {
						props.next(acc, firstIndex)
						acc = [value]
					}
					last = value
				},
			})
		}
	}
}
