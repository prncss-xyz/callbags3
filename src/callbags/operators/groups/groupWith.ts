import type { NonEmptyArray } from '../../../types'
import type { AnyPull, Multi, Source } from '../../sources/core'

export function groupWith<Value, P extends AnyPull>(
	eq: (next: Value, last: Value) => unknown,
) {
	return function <Err>(
		source: Source<Value, Err, P, Multi>,
	): Source<NonEmptyArray<Value>, Err, P, Multi> {
		return function (props) {
			let last: Value
			let acc: Value[] = []
			return source({
				...props,
				complete() {
					if (acc.length > 0) props.next(acc as NonEmptyArray<Value>)
					props.complete()
				},
				next(value) {
					if (acc.length === 0) {
						acc.push(value)
					} else if (eq(value, last!)) {
						acc.push(value)
					} else {
						props.next(acc as NonEmptyArray<Value>)
						acc = [value]
					}
					last = value
				},
			})
		}
	}
}
