import type { Optic, Source } from '../core/types'

import { type Either, toEither } from '../../../../errors/either'
import { _first, _get } from './observe'

export function preview<T, S, EG, EF, F, ES = never>(
	o: Optic<T, S, EG, EF, F>,
) {
	return function (s: S | Source<S, ES>): Either<T, EF | EG | ES> {
		let res: Either<T, EF | EG | ES>
		_preview(o, s, (t) => (res = t))
		return res!
	}
}

export function previewAsync<T, S, EG, EF, F, ES = never>(
	o: Optic<T, S, EG, EF, F>,
) {
	return function (s: S | Source<S, ES>): Promise<Either<T, EF | EG | ES>> {
		return new Promise((resolve) => {
			_preview(o, s, resolve)
		})
	}
}

export function _preview<T, S, EG, EF, ES, F>(
	o: Optic<T, S, EG, EF, F>,
	s: S | Source<S, ES>,
	resolve: (t: Either<T, EF | EG | ES>) => void,
) {
	const { error, next } = toEither<T, EF | EG | ES>(resolve)
	_get(o, s, next, error)
}
