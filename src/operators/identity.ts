import type { AnyMulti, AnyPull, Source } from '../sources/core'

export function identity<
	Value,
	Index,
	Err,
	P extends AnyPull,
	M extends AnyMulti,
>() {
	return function (
		source: Source<Value, Index, Err, P, M>,
	): Source<Value, Index, Err, P, M> {
		return function (o) {
			return source(o)
		}
	}
}
