import { noop, pipe } from '@constellar/core'

import { forbidden } from '../../../../utils'
import { once } from '../sources/sync/once'
import {
	type _OpticArg,
	type _SetterArg,
	type Emitter,
	type Getter,
	LTAGS,
	type Modifier,
	type Optic,
	TAGS,
} from './types'

export const apply = <V>(
	m: (v: V, next: (v: V) => void) => void,
	next: (v: V) => void,
	v: V,
) => m(v, next)

export const inert = <V, M>(_m: M, next: (v: V) => void, v: V) => next(v)

export const trush = <V>(v: V, cb: (v: V) => void) => cb(v)

function composeEmitter<T, S, U, E1, E2>(
	e1: Emitter<U, T, E1>,
	e2: Emitter<T, S, E2>,
): Emitter<U, S, E1 | E2> {
	return pipe(e2, e1)
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
export function getGetter<T, S, EG, EF>(o: _OpticArg<T, S, EG, EF>) {
	if ('getter' in o) return o.getter
	return (r: S, next: (t: T) => void, error: (e: EF | EG) => void) => {
		let dirty = false
		const { start, unmount } = o.emitter(once(r))(
			(t) => {
				dirty = true
				next(t)
				unmount()
			},
			(e: EF | EG) => {
				unmount()
				error(e)
			},
			() => {
				unmount()
				if (!dirty) error(o.toEmpty())
			},
		)
		start()
	}
}

export function getModifier<T, S, EG, EF>(
	o: _SetterArg<T, S, EG, EF>,
): Modifier<T, S> {
	if (o.modifier) return o.modifier
	if ('getter' in o) {
		if ('setter' in o)
			return (m, next, s) =>
				o.getter(
					s,
					(t) => m(t, (t1) => o.setter(t1, next, s)),
					() => next(s),
				)
		if ('reviewer' in o)
			return (m, next, s) =>
				o.getter(
					s,
					(t) => m(t, (t1) => o.reviewer(t1, next)),
					() => next(s),
				)
	}
	throw new Error('unreachable')
}

export function getSetter<T, S, EG, ES>(o: _SetterArg<T, S, EG, ES>) {
	if ('setter' in o) return o.setter
	if ('reviewer' in o) return o.reviewer
	return (t: T, next: (s: S) => void, s: S) =>
		o.modifier((_t, next) => next(t), next, s as any)
}

export function getEmitter<T, S, EG, ES>(
	o: _OpticArg<T, S, EG, ES>,
): Emitter<T, S, ES> {
	if ('emitter' in o) return o.emitter
	return (source) => (next, err, complete) =>
		source((s) => o.getter(s, next, noop), err, complete)
}

export function isSetter<U, T, ES, EG>(
	o: _OpticArg<U, T, ES, EG>,
): o is _SetterArg<U, T, ES, EG> {
	return 'modifier' in o || 'setter' in o || 'reviewer' in o
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type Compo<U, T, E1G, E1F, F1 = {}, LF = {}> = <S, E2G, E2F, F2>(
	o2: Optic<T, S, E2G, E2F> & { [TAGS]: F2 },
) => Optic<U, S, E1G | E2G, E1F | E2F> & { [LTAGS]: LF } & { [TAGS]: F1 & F2 }

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export function _compo<U, T, E1G, E1F, F1 = {}, LF = {}>(
	o1: _OpticArg<U, T, E1G, E1F>,
): <S, E2G, E2F, F2>(
	o2: Optic<T, S, E2G, E2F> & { [TAGS]: F2 },
) => Optic<U, S, E1G | E2G, E1F | E2F> & { [LTAGS]: LF } & { [TAGS]: F1 & F2 }

export function _compo(o1: any) {
	return _compose(o1) as any
}

export function compose<U, T, E1G, E1F, F1>(
	o1: Optic<U, T, E1G, E1F> & { [TAGS]: F1 },
): <S, E2G, E2F, F2>(
	o2: Optic<T, S, E2G, E2F> & { [TAGS]: F2 },
) => Optic<U, S, E1G | E2G, E1F | E2F> & { [TAGS]: F1 & F2 }
export function compose<U, T, E1G, E1F>(o1: Optic<U, T, E1G, E1F>) {
	return _compose(o1) as any
}

function _compose<U, T, E1G, E1F>(o1: _OpticArg<U, T, E1G, E1F>) {
	return function <S, E2G, E2F>(
		o2: _OpticArg<T, S, E2G, E2F>,
	): _OpticArg<U, S, E1G | E2G, E1F | E2F> {
		if ('emitter' in o1 || 'emitter' in o2) {
			const emitter = composeEmitter(getEmitter(o1), getEmitter(o2))
			const toEmpty =
				'toEmpty' in o2
					? o2.toEmpty
					: 'toEmpty' in o1
						? o1.toEmpty
						: forbidden() // TODO: improve with type guard
			if (isSetter(o1) && isSetter(o2)) {
				const m2 = getModifier(o2)
				return {
					emitter,
					modifier: composeModify(getModifier(o1), m2) as any,
					remover:
						o1.remover === trush
							? trush
							: (s: S, next: (s: S) => void) => m2(o1.remover, next, s),
					toEmpty:
						'toEmpty' in o2
							? o2.toEmpty
							: 'toEmpty' in o1
								? o1.toEmpty
								: forbidden(),
				}
			}
			return {
				emitter,
				toEmpty,
			}
		}
		if ('reviewer' in o1 && 'reviewer' in o2)
			return {
				getter: composeGetter(getGetter(o1), o2.getter),
				modifier:
					o1.modifier || o2.modifier
						? composeModify(getModifier(o1), getModifier(o2))
						: undefined,
				remover: trush,
				reviewer: (t: U, next: (s: S) => void) =>
					o1.reviewer(t, (t) => o2.reviewer(t, next)),
			}
		if (isSetter(o1) && isSetter(o2))
			return {
				getter: composeGetter(getGetter(o1), o2.getter),
				modifier:
					o1.modifier || o2.modifier
						? composeModify(getModifier(o1), getModifier(o2))
						: undefined,
				remover:
					'remover' in o1 && o1.remover !== trush
						? (s: S, next: (s: S) => void) =>
								getModifier(o2)(o1.remover, next, s)
						: trush,
				setter:
					'setter' in o2
						? (t: U, next: (s: S) => void, s: S) => {
								o2.getter(
									s,
									(u) => getSetter(o1)(t, (t) => o2.setter(t, next, s), u),
									() => next(s),
								)
							}
						: (t: U, next: (s: S) => void, s: S) => {
								o2.getter(
									s,
									(u) => getSetter(o1)(t, (t) => o2.reviewer(t, next), u),
									() => next(s),
								)
							},
			}
		return {
			getter: composeGetter(getGetter(o1), o2.getter),
		}
	}
}
