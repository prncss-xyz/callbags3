import { emptyError, EmptyError } from '../errors'
import type { AnyPull, MultiSource, SingleSource } from '../sources/core'

export function first<Value, Index, Err, P extends AnyPull>() {
	return function (
		source: MultiSource<Value, Index, Err, P>,
	): SingleSource<Value, Index, Err | EmptyError, P> {
		return function ({ next, error }) {
			return source({
				error,
				next,
				complete: emptyError,
			})
		}
	}
}
