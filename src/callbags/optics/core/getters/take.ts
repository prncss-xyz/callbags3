import { noop } from '@constellar/core'

import { _compo } from '../core/compose'
import { sequence } from './sequence'

export function take<A>(n: number) {
	return sequence<A, A, never>((source) => (next, e, c) => {
		if (n === 0) {
			return {
				start: c,
				unmount: noop,
			}
		}
		let i = 0
		return source(
			(t) => {
				next(t)
				if (++i === n) return c()
			},
			e,
			c,
		)
	})
}
