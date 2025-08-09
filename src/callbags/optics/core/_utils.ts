import type { Modify } from '../../../types'
import type { Optic } from './types'

type AnyPrism = never | void

export function apply<V>(
	m: (v: V, next: (v: V) => void) => void,
	next: (v: V) => void,
	v: V,
) {
	m(v, next)
}

export function trush<V>(v: V, cb: (v: V) => void) {
	cb(v)
}

export function modToCPS<T>(m: Modify<T>) {
	return function (t: T, next: (t: T) => void) {
		next(m(t))
	}
}

function composeGetter<
	T,
	S,
	U,
	E1,
	E2,
	P2 extends AnyPrism,
	P1 extends AnyPrism,
>(o1: Optic<U, T, E1, P1>, o2: Optic<T, S, E2, P2>) {
	if (o2.getter === trush) return o1.getter as any
	if (o1.getter === trush) return o2.getter as any
	return function (s: S, next: (u: U) => void, error: (e: E1 | E2) => void) {
		o2.getter(s, (t) => o1.getter(t, next, error), error)
	}
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
	return function (
		m: (t: U, next: (t: U) => void) => void,
		next: (s: S) => void,
		s: S,
	) {
		o2.modifier((t, on) => o1.modifier(m, on, t), next, s)
	}
}

export function composeNonPrism<U, T, E1>(o1: Optic<U, T, E1, never>) {
	return function <S, E2, P extends AnyPrism>(
		o2: Optic<T, S, E2, P>,
	): Optic<U, S, E1 | E2, never> {
		return {
			emitter: composeGetter(o1, o2),
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
			emitter: composeGetter(o1, o2),
			getter: composeGetter(o1, o2),
			modifier: composeModify(o1, o2),
			remover: o1.remover,
			setter(t, next, s) {
				o1.setter(t, (t) => o2.setter(t, next, s))
			},
		}
	}
}
