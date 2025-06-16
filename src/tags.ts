import type { Prettify } from '@constellar/core'
import { isUnknown, isVoid } from './guards'

export type Tagged<Type, Value> = { readonly type: Type; readonly value: Value }
export type Singleton<Type> = { readonly type: Type; readonly value: void }
type Other<T, Type, V> = Tagged<T extends Type ? never : T, V>

class Tag<Type, Value> {
	private readonly type: Type
	public readonly isValue: (v: unknown) => v is Value
	constructor(type: Type, isValue: (v: unknown) => v is Value) {
		this.type = type
		this.isValue = isValue
	}
	chain<A extends Value, B extends Value>(
		f: (a: A) => Prettify<Tagged<Type, B>>,
	) {
		return <T, O>(
			m: Other<T, Type, O> | Tagged<Type, A>,
		): Other<T, Type, O> | Tagged<Type, B> => {
			if (this.is(m)) return f(m.value)
			return m
		}
	}
	get<V extends Value>(m: Tagged<Type, V>) {
		return m.value
	}
	is<V extends Value, T, O>(
		m: Tagged<Type, V> | Other<T, Type, O>,
	): m is Prettify<Tagged<Type, V>> {
		return m.type === this.type
	}
	map<A extends Value, B extends Value>(f: (a: A) => B) {
		return <T, O>(
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
	isTag(m: unknown): m is Tagged<Type, Value> {
		if (m === null || typeof m !== 'object') return false
		return (m as any).type === this.type && this.isValue((m as any).value)
	}
}

export function tag<const Type, Value>(
	type: Type,
	isValue: (v: unknown) => v is Value = isUnknown as any,
) {
	return new Tag(type, isValue)
}

export function singleton<const T>(type: T) {
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
