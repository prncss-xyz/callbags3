import { emptyError, EmptyError, type DomainError } from '../errors'
import type { AnyPull, MultiSource, SingleSource } from '../sources/core'

export function first<
	Value,
	Index,
	Err extends DomainError,
	P extends AnyPull,
>() {
	return function (
		source: MultiSource<Value, Index, Err, P>,
	): SingleSource<Value, Err | EmptyError, P> {
		return function ({ next, error }) {
			return source({
				error,
				next,
				complete: emptyError,
			})
		}
	}
}
