import { EmptyError, type DomainError } from '../errors'
import type { AnyPull, Observable, Sink } from '../sources/core'

export function first<
	Value,
	Index,
	Err extends DomainError,
	P extends AnyPull,
>() {
	return function (
		source: Observable<Value, Index, Err, P>,
	): Sink<Value, Index, Err | EmptyError, P, Value> {
		return function ({ complete, error }) {
			let dirty = false
			let last: Value
			return {
				...source({
					error,
					next(value) {
						dirty = true
						last = value
						complete()
					},
					complete() {
						if (dirty) complete()
						else error(new EmptyError())
					},
				}),
				result() {
					assert(dirty)
					return last
				},
			}
		}
	}
}
