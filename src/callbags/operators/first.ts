import { CNothingError, type NothingError } from '../errors/nothingError'
import type { AnyPull, MultiSource, SingleSource } from '../sources/core'

const complete = CNothingError.void.bind(CNothingError)

export function first<Value, Index, Err, P extends AnyPull>() {
	return function (
		source: MultiSource<Value, Index, Err, P>,
	): SingleSource<Value, Index, Err | NothingError, P> {
		return function ({ next, error }) {
			return source({
				error,
				next,
				complete,
			})
		}
	}
}
