import { fromInit, type Init } from '@prncss-xyz/utils'

import type { AnyMulti, AnyPull, Source } from '../sources/core'

type T<P, Q> = P extends unknown ? Q : never

export function safeMap<Succ, Err, E, P extends AnyPull, M extends AnyMulti>(
	recover: Init<E, [Err]>,
) {
	return function (
		source: Source<Succ, Err, P, M>,
	): Source<Succ | T<Err, E>, never, P, M> {
		return function ({ complete, next }) {
			return source({
				complete,
				error(e) {
					next(fromInit(recover, e))
				},
				next,
			})
		}
	}
}
