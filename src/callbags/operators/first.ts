import type { AnyPull, MultiSource, SingleSource } from '../sources/core'

import { CNothingError, type NothingError } from '../errors/nothingError'

const complete = CNothingError.void.bind(CNothingError)

export function first<Value, Index, Err, P extends AnyPull>() {
	return function (
		source: MultiSource<Value, Index, Err, P>,
	): SingleSource<Value, Index, Err | NothingError, P> {
		return function ({ context, error, next }) {
			return source({
				complete,
				context,
				error,
				next,
			})
		}
	}
}
