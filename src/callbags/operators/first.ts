import type { AnyPull, MultiSource, SingleSource } from '../sources/core'

import { emptyError, type EmptyError } from '../../errors/empty'

const complete = emptyError.void.bind(emptyError)

export function first<Value, Err, P extends AnyPull>() {
	return function (
		source: MultiSource<Value, Err, P>,
	): SingleSource<Value, EmptyError | Err, P> {
		return function ({ error, next }) {
			return source({
				complete,
				error,
				next,
			})
		}
	}
}
