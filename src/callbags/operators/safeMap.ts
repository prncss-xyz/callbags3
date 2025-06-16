import { fromInit, type Init } from '@prncss-xyz/utils'
import type { AnyMulti, AnyPull, Source } from '../sources/core'

type T<P, Q> = P extends unknown ? Q : never

export function safeMap<
	Succ,
	Index,
	Err,
	E,
	P extends AnyPull,
	M extends AnyMulti,
>(recover: Init<E, [Err]>) {
	return function (
		source: Source<Succ, Index, Err, P, M>,
	): Source<Succ | T<Err, E>, void, never, P, M> {
		return function ({ next, complete }) {
			return source({
				// the second argument can be safely ignored
				next: next as any,
				error(e) {
					next(fromInit(recover, e))
				},
				complete,
			})
		}
	}
}
