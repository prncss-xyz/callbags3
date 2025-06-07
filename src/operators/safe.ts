import type { AnyMulti, AnyPull, Source } from '../sources/core'

type T<P, Q> = P extends unknown ? Q : never

export function safe<
	Succ,
	Index,
	Err,
	S,
	E,
	P extends AnyPull,
	M extends AnyMulti,
>({
	onSuccess,
	onError,
}: {
	onSuccess: (s: Succ) => S
	onError: (e: Err) => E
}) {
	return function (
		source: Source<Succ, Index, Err, P, M>,
	): Source<T<Succ, S> | T<Err, E>, void, never, P, M> {
		return function ({ next, complete }) {
			return source({
				next(succ) {
					next(onSuccess(succ) as any)
				},
				error(e) {
					next(onError(e) as any)
				},
				complete,
			})
		}
	}
}
