import { noop } from '@constellar/core'
import { fromInit, type Init } from '@prncss-xyz/utils'

import type { Modify } from '../../../types'
import type { Emitter, Optic } from './types'

type AnyPrism = never | void

export const apply = <V>(
	m: (v: V, next: (v: V) => void) => void,
	next: (v: V) => void,
	v: V,
) => m(v, next)

export const inert = <V, M>(_m: M, next: (v: V) => void, v: V) => next(v)

export const trush = <V>(v: V, cb: (v: V) => void) => cb(v)

export function modToCPS<T>(m: Modify<T>) {
	return (t: T, next: (t: T) => void) => next(m(t))
}

export const emitOnce =
	<T, E>(next: (t: T) => void, _error: (e: E) => void, complete: () => void) =>
	(t: T) => (next(t), complete(), noop)

function composeEmitter<
	T,
	S,
	U,
	E1,
	E2,
	P1 extends AnyPrism,
	P2 extends AnyPrism,
>(
	o1: Optic<U, T, E1, P1>,
	o2: Optic<T, S, E2, P2>,
): Optic<U, S, E1 | E2, never>['emitter'] {
	return (next, error, complete) => (s) => {
		let unmount1 = noop
		return o2.emitter(
			(t) => {
				const { start, unmount } = o1.emitter(next, error, noop)(t)
				unmount1 = unmount
				start()
			},
			(e) => (unmount1(), error(e)),
			() => (unmount1(), complete()),
		)(s)
	}
}

function composeGetter<
	T,
	S,
	U,
	E1,
	E2,
	P1 extends AnyPrism,
	P2 extends AnyPrism,
>(
	o1: Optic<U, T, E1, P1>,
	o2: Optic<T, S, E2, P2>,
): Optic<U, S, E1 | E2, never>['getter'] {
	if (o2.getter === trush) return o1.getter as any
	if (o1.getter === trush) return o2.getter as any
	return (s: S, next: (u: U) => void, error: (e: E1 | E2) => void) =>
		o2.getter(s, (t) => o1.getter(t, next, error), error)
}

function composeModify<
	T,
	S,
	U,
	E1,
	E2,
	P1 extends AnyPrism,
	P2 extends AnyPrism,
>(o1: Optic<U, T, E1, P1>, o2: Optic<T, S, E2, P2>) {
	if (o2.modifier === apply) return o1.modifier as any
	if (o1.modifier === apply) return o2.modifier as any
	return (
		m: (t: U, next: (t: U) => void) => void,
		next: (s: S) => void,
		s: S,
	) => o2.modifier((t, on) => o1.modifier(m, on, t), next, s)
}

export function composeNonPrism<U, T, E1>(o1: Optic<U, T, E1, never>) {
	return function <S, E2, P extends AnyPrism>(
		o2: Optic<T, S, E2, P>,
	): Optic<U, S, E1 | E2, never> {
		return {
			emitter: composeEmitter(o1, o2),
			getter: composeGetter(o1, o2),
			modifier: composeModify(o1, o2),
			remover: o1.remover,
			setter(t, next, s) {
				o2.getter(
					s,
					(u) => o1.setter(t, (t) => o2.setter(t, next, s), u),
					() => next(s),
				)
			},
		}
	}
}

export function composePrism<U, T, E2>(o1: Optic<U, T, E2, void>) {
	return function <S, E1, P extends AnyPrism>(
		o2: Optic<T, S, E1, P>,
	): Optic<U, S, E1 | E2, P> {
		return {
			emitter: composeEmitter(o1, o2),
			getter: composeGetter(o1, o2),
			modifier: composeModify(o1, o2),
			remover: o1.remover,
			setter(t, next, s) {
				o1.setter(t, (t) => o2.setter(t, next, s))
			},
		}
	}
}

export function foldGetter<Value, S, E, Acc, Res>(
	emitter: Emitter<Value, S, E>,
	{
		fold,
		init,
		result,
	}: {
		fold: (value: Value, acc: Acc) => Acc
		init: Init<Acc>
		result: (acc: Acc) => Res
	},
) {
	return (s: S, next: (res: Res) => void, error: (e: E) => void) => {
		let acc: Acc
		acc = fromInit(init)
		const { start, unmount } = emitter(
			(value) => (acc = fold(value, acc)),
			(e) => (error(e), unmount()),
			() => (unmount(), next(result(acc))),
		)(s)
		start()
	}
}
