import type { DomainError } from '../errors'
import type { AnyPull, Source } from '../sources/core'

export function identity<
	Value,
	Index,
	Err extends DomainError,
	P extends AnyPull,
>() {
	return function (
		source: Source<Value, Index, Err, P>,
	): Source<Value, Index, Err, P> {
		return function (o) {
			return source(o)
		}
	}
}
