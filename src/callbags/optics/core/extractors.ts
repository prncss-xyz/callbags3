import { noop } from '@constellar/core'
import { fromInit, isoAssert } from '@prncss-xyz/utils'

import type { Modify, NonFunction } from '../../../types'
import type { Optic } from './core/types'

import { type Either, toEither } from '../../../errors/either'
import { isFunction } from '../../../guards/primitives'
import {
	getEmitter,
	getGetter,
	getModifier,
	getSetter,
	isSetter,
	modToCPS,
} from './core/compose'
import { inArray } from './operators/traversal'

export function view<T, S, F>(o: Optic<T, S, never, F>) {
	return function (s: S): T {
		let res: T
		getGetter(o)(
			s,
			(t) => (res = t),
			(e) => {
				throw new Error(`Unexpected error: ${e}`)
			},
		)
		return res!
	}
}

export function preview<T, S, E, F>(o: Optic<T, S, E, F>) {
	return function (s: S): Either<T, E> {
		let res: Either<T, E>
		const { error, next } = toEither<T, E>((t) => (res = t))
		getGetter(o)(s, next, error)
		return res!
	}
}

export function collect<Value, S, E, F>(o: Optic<Value, S, E, F>) {
	const t = inArray<Value>()
	return (s: S) => {
		let acc: Value[]
		acc = fromInit(t.init)
		const { start, unmount } = getEmitter(o)(
			(value) => (acc = t.fold(value, acc)),
			() => {
				unmount()
				throw new Error('unexpected error')
			},
			() => (unmount(), noop),
		)(s)
		start()
		return acc
	}
}

export function review<T, S, E, F>(
	o: Optic<T, S, E, Exclude<F, { optional: true }>>,
) {
	isoAssert('reviewer' in o)
	return function (t: T): S {
		let res: S
		o.reviewer(t, (s) => (res = s))
		return res!
	}
}

function put<T, S, E, F>(o: Optic<T, S, E, Exclude<F, { getter: true }>>) {
	isoAssert(isSetter(o))
	return function (t: T) {
		return function (s: S): S {
			let res: S
			getSetter(o)(t, (s) => (res = s), s)
			return res!
		}
	}
}

function over<T, S, E, F>(o: Optic<T, S, E, Exclude<F, { getter: true }>>) {
	isoAssert(isSetter(o))
	return function (m: Modify<T>) {
		return function (s: S): S {
			let res: S
			getModifier(o)(modToCPS(m), (s) => (res = s), s)
			return res!
		}
	}
}

function remove<T, S, E, F>(
	o: Optic<T, S, E, Exclude<F, { getter: true }>, { optional: true }>,
) {
	isoAssert('remover' in o)
	return function (s: S): S {
		let res: S
		o.remover(s, (s) => (res = s))
		return res!
	}
}

export const REMOVE = Symbol('REMOVE')

export function update<T, S, E, F>(
	o: Optic<
		T,
		S,
		E,
		Exclude<
			F,
			{
				getter: true
			}
		>,
		{ removable: true }
	>,
): (m: Modify<T> | NonFunction<T> | typeof REMOVE) => (s: S) => S
export function update<T, S, E, F>(
	o: Optic<
		T,
		S,
		E,
		Exclude<
			F,
			{
				getter: true
			}
		>
	>,
): (m: Modify<T> | NonFunction<T>) => (s: S) => S
export function update<T, S, E, F>(
	o: Optic<T, S, E, Exclude<F, { getter: true }>>,
) {
	return function (m: Modify<T> | NonFunction<T>) {
		if (m === REMOVE) {
			return remove(o as any)
		}
		if (isFunction(m)) {
			return over(o)(m)
		}
		return put(o)(m)
	}
}
