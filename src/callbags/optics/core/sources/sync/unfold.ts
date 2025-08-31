import { fromInit, type Init } from '@prncss-xyz/utils'

import type { Source } from '../../core/types'

import { type Either, succ } from '../../../../../errors'

export function unfold<Value>(
	init: Init<Value>,
	cb: (acc: Value) => Either<Value, unknown>,
): Source<Value, never> {
	return function (next, _err, complete) {
		let closed = false
		return {
			start() {
				let res = cb(fromInit(init))
				while (succ.is(res)) {
					next(succ.get(res))
					if (closed) return
					res = cb(succ.get(res))
				}
				complete()
			},
			unmount() {
				closed = true
			},
		}
	}
}
