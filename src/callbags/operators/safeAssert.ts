import type { AnyMulti, AnyPull, Source } from '../sources/core'

export function safeAssert<
	Succ,
	Context,
	Err,
	P extends AnyPull,
	M extends AnyMulti,
>() {
	return function (
		source: Source<Succ, Context, Err, P, M>,
	): Source<Succ, Context, never, P, M> {
		return function ({ next, complete, context }) {
			return source({
				context,
				next,
				error(e) {
					throw new Error(`unexpected error: ${e}`)
				},
				complete,
			})
		}
	}
}
