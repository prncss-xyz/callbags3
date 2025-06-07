import { emptyError, EmptyError, type DomainError } from '../errors'
import type { AnyPull, Source, Sink } from '../sources/core'

export function first<
	Value,
	Index,
	Err extends DomainError,
	P extends AnyPull,
>() {
	return function (
		source: Source<Value, Index, Err, P>,
	): Sink<Value, Err | EmptyError, P> {
		return function ({ success, error }) {
			return source({
				error,
				next: success,
				complete: emptyError,
			})
		}
	}
}
