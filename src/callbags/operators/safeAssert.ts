import type { AnyMulti, AnyPull, Source } from '../sources/core'

export function safeAssert<
	Succ,
	Index,
	Err,
	P extends AnyPull,
	M extends AnyMulti,
>() {
	return function (
		source: Source<Succ, Index, Err, P, M>,
	): Source<Succ, Index, never, P, M> {
		return function ({ next, complete }) {
			return source({
				next,
				error(e) {
					throw new Error(`unexpected error: ${e}`)
				},
				complete,
			})
		}
	}
}
