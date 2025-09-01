import { fromInit } from '@prncss-xyz/utils'

import type { Optic, Source } from '../core/types'

import { isFunction } from '../../../../guards/primitives'
import { inArray } from '../bx/traversal'
import { getEmitter } from '../core/compose'
import { once } from '../sources/sync/once'

export function collect<Value, S, EG, EF, F>(o: Optic<Value, S, EG, EF, F>) {
	return function (s: S | Source<S, never>) {
		let res: Value[]
		_collect(o, (r) => (res = r), s)
		return res!
	}
}

export function collectAsync<Value, S, EG, EF, F>(o: Optic<Value, S, EG, EF, F>) {
	return function (s: S | Source<S, never>) {
		return new Promise<Value[]>((resolve) => {
			_collect(o, resolve, s)
		})
	}
}

export function _collect<Value, S, EG, EF, F>(
	o: Optic<Value, S, EG, EF, F>,
	resolve: (values: Value[]) => void,
	s: S | Source<S, never>,
) {
	const t = inArray<Value>()
	let acc: Value[]
	acc = fromInit(t.init)
	const { start, unmount } = getEmitter(o)(isFunction(s) ? s : once(s))(
		(value) => (acc = t.fold(value, acc)),
		() => {
			unmount()
			throw new Error('unexpected error')
		},
		() => (unmount(), resolve(acc)),
	)
	start()
}
