
import type { Optic } from '../core/types'

import { type Either, toEither } from '../../../../errors/either'
import {
	getGetter,
} from '../core/compose'

export function preview<T, S, E, F>(o: Optic<T, S, E, F>) {
	return function (s: S): Either<T, E> {
		let res: Either<T, E>
		const { error, next } = toEither<T, E>((t) => (res = t))
		getGetter(o)(s, next, error)
		return res!
	}
}
