import type { AnyMulti, AnyPull, Source } from '../sources/core'

export function identity<Value, Err, P extends AnyPull, M extends AnyMulti>() {
	return function (source: Source<Value, Err, P, M>): Source<Value, Err, P, M> {
		return function (o) {
			return source(o)
		}
	}
}
