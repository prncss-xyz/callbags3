import type { DomainError } from '../errors'
import type { AnyPull, MultiSource } from '../sources/core'

export function identity<
	Value,
	Index,
	Err extends DomainError,
	P extends AnyPull,
>() {
	return function (
		source: MultiSource<Value, Index, Err, P>,
	): MultiSource<Value, Index, Err, P> {
		return function (o) {
			return source(o)
		}
	}
}
