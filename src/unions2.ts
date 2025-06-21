import { type Guard } from './guards'
import { type Prettify } from './types'

type Tagged<Type, Value> = { readonly type: Type; readonly value: Value }
type AnyTagged = Tagged<unknown, unknown>
type UU<Type, Value> =
	| Tagged<Type, Value>
	| Tagged<Exclude<unknown, Type>, unknown>

type AnyValue<Type, U> = (Tagged<Type, unknown> & U)['value']
type Self<Type, U, Value extends AnyValue<Type, U>> = Prettify<
	Tagged<Type, Value> & U
>
type Other<Type, U, T, V> = Exclude<U, Tagged<Type, unknown>> & Tagged<T, V>

class Tag<U extends AnyTagged, Type extends U['type']> {
	private readonly type: Type
	public readonly isValue: (v: unknown) => v is U['value']
	constructor(type: Type, isValue: (v: unknown) => v is U['value']) {
		this.type = type
		this.isValue = isValue
	}
	chain<A extends AnyValue<Type, U>, B extends AnyValue<Type, U>>(
		f: (a: A) => Self<Type, U, B>,
	) {
		return <T, V>(
			m: Other<Type, U, T, V> | Self<Type, U, A>,
		): Other<Type, U, T, V> | Self<Type, U, B> => {
			if (this.is(m)) return f(m.value)
			return m
		}
	}
	get<A extends AnyValue<Type, U>>(m: Self<Type, U, A>) {
		return m.value
	}
	is<Value extends AnyValue<Type, U>>(m: U): m is Self<Type, U, Value> {
		return m.type === this.type
	}
	map<A extends AnyValue<Type, U>, B extends AnyValue<Type, U>>(
		f: (a: A) => B,
	) {
		return <T, V>(
			m: Other<Type, U, T, V> | Self<Type, U, A>,
		): Other<Type, U, T, V> | Self<Type, U, B> => {
			if (this.is(m)) return this.of(f(m.value))
			return m
		}
	}
	of<Value extends AnyValue<Type, U>>(value: Value) {
		return { type: this.type, value } as Readonly<Self<Type, U, Value>>
	}
	void(_v: (U & { type: Type })['value'] extends void ? void : never) {
		return this.of(_v)
	}
	isTag(m: unknown): m is AnyValue<Type, U> {
		return (
			typeof m === 'object' &&
			m !== null &&
			(m as any).type === this.type &&
			// this means an absent value key is equivale to a value of undefined
			this.isValue((m as any).value)
		)
	}
}

const _union = Symbol('union')

export function union<
	Brand extends symbol,
	Props extends Record<string, (v: unknown) => v is unknown>,
>(_brand: Brand, props: Props) {
	const members: any = {}
	for (const [key, isValue] of Object.entries(props)) {
		members[key] = new Tag(key, isValue)
	}
	type P = {
		[K in keyof Props]: { type: K; value: Guard<Props[K]> }
	}
	const union = _union
	type U = Prettify<P[keyof P] & { [union]: Brand }>
	type Members = {
		[K in keyof Props]: Tag<U, K>
	}
	function isUnion(v: unknown): v is U {
		return Boolean(
			typeof v === 'object' &&
				v !== null &&
				props[(v as any).type]?.((v as any).value),
		)
	}
	return [isUnion, members as Members] as const
}

export function tag<const Type, Value>(
	type: Type,
	isValue: (v: unknown) => v is Value,
) {
	return new Tag<UU<Type, Value>, Type>(type, isValue)
}

/*
 *
import { isNumber, isString } from '@prncss-xyz/utils'

const u = tag('u', isNumber)
const v = tag('v', isString)
type U = Guarded<typeof u.is>
type V = Guarded<typeof v.is>

function f(x: U | V) {
	const y = u.map((x) => x + 1)(x)
}
*/
