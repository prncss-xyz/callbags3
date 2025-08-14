import { noop } from '@constellar/core'

import type { Modify } from '../../../types'

import { emptyError } from '../../../errors/empty'
import { type Emitter, type Getter, type Optic } from './types'

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

function composeEmitter<T, S, U, E1, E2>(
	e1: Emitter<U, T, E1>,
	e2: Emitter<T, S, E2>,
): Emitter<U, S, E1 | E2> {
	return (next, error, complete) => (s) => {
		let unmount1 = noop
		const { start, unmount } = e2(
			(t) => {
				const { start, unmount } = e1(next, error, noop)(t)
				unmount1 = unmount
				start()
			},
			(e) => (unmount1(), error(e)),
			() => (unmount1(), complete()),
		)(s)
		return {
			start,
			unmount: () => {
				unmount1()
				unmount()
			},
		}
	}
}

function composeGetter<T, S, U, E1, E2>(
	g1: Getter<U, T, E1>,
	g2: Getter<T, S, E2>,
): Getter<U, S, E1 | E2> {
	if (g2 === trush) return g1 as any
	if (g1 === trush) return g2 as any
	return (s: S, next: (u: U) => void, error: (e: E1 | E2) => void) =>
		g2(s, (t) => g1(t, next, error), error)
}

function composeModify<T, S, U>(
	m1: (
		m: (t: U, next: (t: U) => void) => void,
		next: (s: T) => void,
		s: T,
	) => void,

	m2: (
		m: (t: T, next: (t: T) => void) => void,
		next: (s: S) => void,
		s: S,
	) => void,
) {
	if (m2 === apply) return m1 as any
	if (m1 === apply) return m2 as any
	return (
		m: (t: U, next: (t: U) => void) => void,
		next: (s: S) => void,
		s: S,
	) => m2((t, on) => m1(m, on, t), next, s)
}

// TODO: make sure EmptyError is in Multi
export const getGetter = <T, S, E, P extends void>(o: Optic<T, S, E, P>) => {
	if ('getter' in o) return o.getter
	return (r: S, next: (t: T) => void, error: (e: E) => void) => {
		let dirty = false
		const { start, unmount } = o.emitter(
			(t) => {
				dirty = true
				unmount()
				next(t)
			},
			(e) => {
				unmount()
				error(e)
			},
			() => {
				unmount()
				if (!dirty) error(emptyError as E)
			},
		)(r)
		start()
	}
}

// FIXME: multi cannot be affine
export const getSetter = <T, S, E, P extends void>(o: Optic<T, S, E, P>) => {
	if ('setter' in o) return o.setter
	return (t: T, next: (s: S) => void, s: P | S) =>
		o.modifier((_t, next) => next(t), next, s as any)
}

export const getEmitter = <T, S, E, P extends void>(
	o: Optic<T, S, E, P>,
): Emitter<T, S, E> => {
	if ('emitter' in o) return o.emitter
	return (next, _error, complete) => (s) => {
		let open = true
		return {
			start: () => {
				if (open) o.getter(s, (t) => next(t), noop)
				complete()
			},
			unmount: () => {
				open = false
			},
		}
	}
}

export function composeNonPrism<U, T, E1, F1>(o1: Optic<U, T, E1, never, F1>) {
	return function <S, E2, P extends AnyPrism, F2>(
		o2: Optic<T, S, E2, P, F2>,
	): Optic<U, S, E1 | E2, never, F1 & F2> {
		if ('emitter' in o2) {
			const emitter = composeEmitter(getEmitter(o1), o2.emitter)
			return {
				emitter,
				modifier: composeModify(o1.modifier, o2.modifier),
				remover: o1.remover,
			}
		}
		return {
			getter: composeGetter(getGetter(o1), o2.getter),
			modifier: composeModify(o1.modifier, o2.modifier),
			remover: o1.remover,
			setter(t: U, next: (s: S) => void, s: S) {
				o2.getter(
					s,
					(u) => getSetter(o1)(t, (t) => o2.setter(t, next, s), u),
					() => next(s),
				)
			},
		}
	}
}

export function composePrism<U, T, E2, F1>(o1: Optic<U, T, E2, void, F1>) {
	return function <S, E1, P extends AnyPrism, F2>(
		o2: Optic<T, S, E1, P, F2>,
	): Optic<U, S, E1 | E2, P, F1 & F2> {
		if ('emitter' in o2) {
			const emitter = composeEmitter(getEmitter(o1), o2.emitter)
			return {
				emitter,
				modifier: composeModify(o1.modifier, o2.modifier),
				remover: o1.remover,
			}
		}
		return {
			getter: composeGetter(getGetter(o1), o2.getter),
			modifier: composeModify(o1.modifier, o2.modifier),
			remover: o1.remover,
			setter(t: U, next: (s: S) => void, s: P | S) {
				const f = getSetter(o1)
				f(t, (t) => o2.setter(t, next, s))
			},
		}
	}
}

export function composeMulti<U, T, E2, F1>(o1: Optic<U, T, E2, never, F1>) {
	return function <S, E1, P extends AnyPrism, F2>(
		o2: Optic<T, S, E1, P, F2>,
	): Optic<U, S, E1 | E2, never, F1 & F2> {
		return {
			// with better typing we could use `o1.emitter` here
			emitter: composeEmitter(getEmitter(o1), getEmitter(o2)),
			modifier: composeModify(o1.modifier, o2.modifier),
			remover: o1.remover,
		}
	}
}
