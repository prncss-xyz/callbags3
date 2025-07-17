import type { AnyPull, MultiSource } from '../../sources/core'

import { defer } from '../../../utils'

export function take<Value, Err, P extends AnyPull>(n: number) {
	return function (
		source: MultiSource<Value, Err, P>,
	): MultiSource<Value, Err, P> {
		return function ({ complete, error, next }) {
			let i = 0
			const props = source({
				complete,
				error,
				next(value) {
					i++
					if (i === n) complete()
					next(value)
				},
			})
			if (n === 0) {
				if (props.pull) {
					props.pull = complete as any
				} else defer(complete)
			}
			return props
		}
	}
}
