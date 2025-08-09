import type { Modify } from '../../../types'
import type { Optic } from './types'

type AnyPrism = never | void

export function apply<V>(
	m: (v: V, onSuccess: (v: V) => void) => void,
	onSuccess: (v: V) => void,
	v: V,
) {
	m(v, onSuccess)
}

export function trush<V>(v: V, cb: (v: V) => void) {
	cb(v)
}

export function modToCPS<T>(m: Modify<T>) {
	return function (t: T, onSuccess: (t: T) => void) {
		onSuccess(m(t))
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
	return function (
		s: S,
		onSuccess: (u: U) => void,
		onError: (e: E1 | E2) => void,
	) {
		o2.getter(s, (t) => o1.getter(t, onSuccess, onError), onError)
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
		m: (t: U, onSuccess: (t: U) => void) => void,
		onSuccess: (s: S) => void,
		s: S,
	) {
		o2.modifier((t, on) => o1.modifier(m, on, t), onSuccess, s)
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
			setter(t, onSuccess, s) {
				o2.getter(
					s,
					(u) => o1.setter(t, (t) => o2.setter(t, onSuccess, s), u),
					() => onSuccess(s),
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
			setter(t, onSuccess, s) {
				o1.setter(t, (t) => o2.setter(t, onSuccess, s))
			},
		}
	}
}
