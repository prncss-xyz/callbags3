import type { AnyMulti, AnyPull, Source } from '../sources/core'

export function safeAssert<Succ, Err, P extends AnyPull, M extends AnyMulti>() {
	return function (source: Source<Succ, Err, P, M>): Source<Succ, never, P, M> {
		return function ({ complete, next }) {
			return source({
				complete,
				error(e) {
					throw new Error(`unexpected error: ${e}`)
				},
				next,
			})
		}
	}
}
