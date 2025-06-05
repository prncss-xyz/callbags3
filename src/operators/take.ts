import type { DomainError } from '../errors'
import type { AnyPull, Observable } from '../sources/core'

export function take<Value, Index, Err extends DomainError, P extends AnyPull>(
	n: number,
) {
	return function (
		source: Observable<Value, Index, Err, P>,
	): Observable<Value, Index, Err, P> {
		return function ({ next, complete, error }) {
			let i = 0
			const props = source({
				next(value, index) {
					i++
					if (i === n) complete()
					next(value, index)
				},
				complete,
				error,
			})
			if (n === 0) {
				if (props.pull) {
					props.pull = complete as any
				} else complete()
			}
			return props
		}
	}
}
