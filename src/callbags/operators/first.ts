import type { AnyPull, MultiSource, SingleSource } from '../sources/core'

import { emptyError, type EmptyError } from '../../errors/empty'

const complete = emptyError.void.bind(emptyError)

export function first<Value, Index, Err, P extends AnyPull>() {
	return function (
		source: MultiSource<Value, Index, Err, P>,
	): SingleSource<Value, Index, EmptyError | Err, P> {
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
