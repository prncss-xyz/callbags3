import type { Optic, Source } from '../core/types'

import { isFunction } from '../../../../guards/primitives'
import { exhaustive } from '../../../../utils'
import { getGetter } from '../core/compose'
import { _observe } from './observe'

export function view<T, S, F>(o: Optic<T, S, never, F>) {
	return function (s: S | Source<S, never>): T {
		let res: T
		_view(o, s, (t) => (res = t))
		return res!
	}
}

export function viewAsync<T, S, F>(o: Optic<T, S, never, F>) {
	return function (s: S | Source<S, never>) {
		return new Promise<T>((resolve) => {
			_view(o, s, resolve)
		})
	}
}

export function _view<T, S, F>(
	o: Optic<T, S, never, F>,
	s: S | Source<S, never>,
	resolve: (t: T) => void,
) {
	if (isFunction(s)) _observe(s, o, resolve, exhaustive)
	else getGetter(o)(s, resolve, exhaustive)
}
