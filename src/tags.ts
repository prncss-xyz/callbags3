import type { Prettify } from '@constellar/core'

import type { Tagged } from './types'

import { isUnknown, isVoid } from './guards'

type Other<T extends PropertyKey, Type extends PropertyKey, V> = Tagged<
	T extends Type ? never : T,
	V
>

class Tag<Type extends PropertyKey, Value> {
	public readonly isValue: (v: unknown) => v is Value
	private readonly type: Type
	constructor(type: Type, isValue: (v: unknown) => v is Value) {
		this.type = type
		this.isValue = isValue
	}
	chain<A extends Value, B extends Value>(
		f: (a: A) => Prettify<Tagged<Type, B>>,
	) {
		return <T extends PropertyKey, O>(
			m: Other<T, Type, O> | Tagged<Type, A>,
		): Other<T, Type, O> | Tagged<Type, B> => {
			if (this.is(m)) return f(m.value)
			return m
		}
	}
	get<V extends Value>(m: Tagged<Type, V>) {
		return m.value
	}
	is<V extends Value, T extends PropertyKey, O>(
		m: Other<T, Type, O> | Tagged<Type, V>,
	): m is Prettify<Tagged<Type, V>> {
		return m.type === this.type
	}
	isTag(m: unknown): m is Tagged<Type, Value> {
		if (m === null || typeof m !== 'object') return false
		return (m as any).type === this.type && this.isValue((m as any).value)
	}
	map<A extends Value, B extends Value>(f: (a: A) => B) {
		return <T extends PropertyKey, O>(
			m: Other<T, Type, O> | Tagged<Type, A>,
		): Prettify<Other<T, Type, O>> | Tagged<Type, B> => {
			if (this.is(m)) return this.of(f(m.value))
			return m
		}
	}
	of<V extends Value>(value: V) {
		return { type: this.type, value } as Readonly<Tagged<Type, V>>
	}
	void(_v: Value extends void ? void : never) {
		return this.of(_v as any)
	}
}

export function tag<const Type extends PropertyKey, Value>(
	type: Type,
	isValue: (v: unknown) => v is Value = isUnknown as any,
) {
	return new Tag(type, isValue)
}

export function singleton<const Type extends PropertyKey>(type: Type) {
	return new Tag(type, isVoid)
}

/*
 *
import { isNumber, isString } from '@prncss-xyz/utils'
ymport { type Guarded } from './guards'

const u = tag('u', isNumber)
const v = tag('v', isString)
type U = Guarded<typeof u.is>
type V = Guarded<typeof v.is>

function f(x: U | V) {
	const y = u.map((x) => x + 1)(x)
}
*/
