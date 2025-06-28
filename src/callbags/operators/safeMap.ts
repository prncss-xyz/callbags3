import { fromInit, type Init } from '@prncss-xyz/utils'

import type { AnyMulti, AnyPull, Source } from '../sources/core'

type T<P, Q> = P extends unknown ? Q : never

export function safeMap<
	Succ,
	Context,
	Err,
	E,
	P extends AnyPull,
	M extends AnyMulti,
>(recover: Init<E, [Err]>) {
	return function (
		source: Source<Succ, Context, Err, P, M>,
	): Source<Succ | T<Err, E>, Context, never, P, M> {
		return function ({ complete, context, next }) {
			return source({
				complete,
				context,
				error(e) {
					next(fromInit(recover, e))
				},
				// the second argument can be safely ignored
				next: next as any,
			})
		}
	}
}
