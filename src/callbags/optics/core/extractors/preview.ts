import type { Optic, Source } from '../core/types'

import { type Either, toEither } from '../../../../errors/either'
import { _first, _get } from './observe'

export function preview<T, S, EO, F, ES = never>(o: Optic<T, S, EO, F>) {
	return function (s: S | Source<S, ES>): Either<T, EO | ES> {
		let res: Either<T, EO | ES>
		_preview(o, s, (t) => (res = t))
		return res!
	}
}

export function previewAsync<T, S, EO, F, ES = never>(o: Optic<T, S, EO, F>) {
	return function (s: S | Source<S, ES>): Promise<Either<T, EO | ES>> {
		return new Promise((resolve) => {
			_preview(o, s, resolve)
		})
	}
}

export function _preview<T, S, EO, ES, F>(
	o: Optic<T, S, EO, F>,
	s: S | Source<S, ES>,
	resolve: (t: Either<T, EO | ES>) => void,
) {
	const { error, next } = toEither<T, EO | ES>(resolve)
	_get(o, s, next, error)
}
