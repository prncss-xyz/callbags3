import { noop } from '@constellar/core'
import { fromInit, type Init, isoAssert } from '@prncss-xyz/utils'

import type { Modify, NonFunction } from '../../../types'
import type { Optic, Source } from './core/types'

import { type Either, toEither } from '../../../errors/either'
import { isFunction } from '../../../guards/primitives'
import { exhaustive } from '../../../utils'
import { inArray } from './bx/traversal'
import {
	getEmitter,
	getGetter,
	getModifier,
	getSetter,
	isSetter,
	modToCPS,
	once,
} from './core/compose'
import { eq, type Eq } from './core/focus'

export function view<T, S, F>(o: Optic<T, S, never, F>) {
	return function (s: S | Source<S, never>): T {
		let res: T
		const resolve = (t: T) => (res = t)
		if (isFunction(s)) _observe(s, o, resolve, exhaustive)
		else getGetter(o)(s, resolve, exhaustive)
		return res!
	}
}

export function viewAsync<T, S, F>(o: Optic<T, S, never, F>) {
	return function (s: S | Source<S, never>) {
		return new Promise<T>((resolve) => {
			if (isFunction(s)) _observe(s, o, resolve, exhaustive)
			else getGetter(o)(s, resolve, exhaustive)
		})
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
		const { start, unmount } = getEmitter(o)(once(s))(
			(value) => (acc = t.fold(value, acc)),
			() => {
				unmount()
				throw new Error('unexpected error')
			},
			() => (unmount(), noop),
		)
		start()
		return acc
	}
}

type Observer<T, E> =
	| ((t: T) => void)
	| Partial<{
			complete: () => void
			error: (e: E) => void
			next: (t: T) => void
	  }>

function resolveObserver<T, E>(observer: Observer<T, E>, unmount: () => void) {
	if (typeof observer === 'function') return [observer, noop, unmount] as const
	const { complete, error, next } = observer
	return [
		next ?? noop,
		error ?? noop,
		complete
			? () => {
					observer.complete!()
					unmount()
				}
			: unmount,
	] as const
}

function _observe<T, S, E1, E2, F>(
	source: Source<S, E1>,
	o: Init<Optic<T, S, E2, F>, [Eq<S>]>,
	next: (t: T) => void,
	error: (e: E1 | E2) => void,
) {
	const { start, unmount } = getEmitter(fromInit(o, eq()))(source)(
		next,
		error,
		() => unmount,
	)
	start()
}

export function observe<T, S, E1, E2, F>(
	source: Source<S, E1>,
	o: Init<Optic<T, S, E2, F>, [Eq<S>]>,
	observer: Observer<T, E1 | E2>,
) {
	const { start, unmount } = getEmitter(fromInit(o, eq()))(source)(
		...resolveObserver(observer, () => unmount!),
	)
	start()
}

export function process<T, S, F>(
	source: Source<S, never>,
	o: Init<Optic<T, S, never, F>, [Eq<S>]>,
	observer: Observer<T, never>,
) {
	const { start, unmount } = getEmitter(fromInit(o, eq()))(source)(
		...resolveObserver(observer, () => unmount!),
	)
	start()
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
