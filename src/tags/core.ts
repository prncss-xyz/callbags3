import type { Prettify, ValueUnion } from '../types'

import { isPropertyKey } from '../guards'

// TODO: readonly
export type Tagged<Type extends PropertyKey, Value> = {
	type: Type
	value: Value
}

export function tag<Type extends PropertyKey>(
	type: Type,
	value?: undefined,
): Tagged<Type, void>
export function tag<Type extends PropertyKey, Value>(
	type: Type,
	value: Value,
): Tagged<Type, Value>
export function tag<Type extends PropertyKey, Value>(
	type: Type,
	value: Value,
): Tagged<Type, Value> {
	return { type, value }
}

export function makeSingleton<Type extends PropertyKey>(
	type: Type,
): Tagged<Type, void> {
	return { type, value: undefined }
}

export type Tags<Tags, Context = unknown> = Prettify<
	ValueUnion<{ [K in keyof Tags]: Tagged<K, Context & Tags[K]> }>
>
export type UnTags<T extends AnyTagged> = {
	[K in T['type']]: (T & { type: K })['value']
}
export type Singleton<Type extends PropertyKey> = { type: Type; value: void }
export type AnyTagged = Tagged<PropertyKey, unknown>

export type ValueFor<S extends AnyTagged, Type extends S['type']> = (S & {
	type: Type
})['value']
export type BottomTag = Tagged<never, unknown>

export type SingletonKeys<T extends AnyTagged> =
	T extends Tagged<infer K, void> ? K : never

export function isTagged(u: unknown): u is AnyTagged {
	return (
		u !== null &&
		typeof u === 'object' &&
		'value' in u &&
		'type' in u &&
		isPropertyKey(u)
	)
}

export type Send<Res extends AnyTagged> = Res | SingletonKeys<Res>

export function fromSend<Res extends AnyTagged>(v: Send<Res>): Res {
	if (typeof v === 'object') return v
	return makeSingleton(v as any) as Res
}
