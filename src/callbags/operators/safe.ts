import type { AnyMulti, AnyPull, Source } from '../sources/core'

type T<P, Q> = P extends unknown ? Q : never

export function safe<
	Succ,
	Context,
	Err,
	S,
	E,
	P extends AnyPull,
	M extends AnyMulti,
>(toSuccess: (s: Succ) => S, toError: (e: Err) => E) {
	return function (
		source: Source<Succ, Context, Err, P, M>,
	): Source<T<Err, E> | T<Succ, S>, Context, never, P, M> {
		return function ({ complete, context, next }) {
			return source({
				complete,
				context,
				error(e) {
					next(toError(e) as any)
				},
				next(succ) {
					next(toSuccess(succ) as any)
				},
			})
		}
	}
}
