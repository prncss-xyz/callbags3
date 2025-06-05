import type { DomainError } from '../errors'
import type { AnyPull, Observable } from '../sources/core'

export function identity<
	Value,
	Index,
	Err extends DomainError,
	P extends AnyPull,
>() {
	return function (
		source: Observable<Value, Index, Err, P>,
	): Observable<Value, Index, Err, P> {
		return function (o) {
			return source(o)
		}
	}
}
