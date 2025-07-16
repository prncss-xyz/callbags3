import { type AnyTagged, isTagged, type Tagged, type Tags } from './core'

type AnyValue<Type extends PropertyKey, U> = (Tagged<Type, unknown> &
	U)['value']
type Self<
	Type extends PropertyKey,
	U,
	Value extends AnyValue<Type, U>,
> = Tagged<Type, Value> & U
type Other<
	Type extends PropertyKey,
	U,
	Value extends AnyValue<Type, U>,
> = Exclude<U, Self<Type, U, Value>>

class TagClass<U extends AnyTagged, Type extends U['type']> {
	private readonly _type
	constructor(type: Type) {
		this._type = type
	}
	// FIXME:
	chain<A extends AnyValue<Type, U>, B extends U>(f: (a: A) => B) {
		return (m: Other<Type, U, A> | Self<Type, U, A>): B | Other<Type, U, A> => {
			if (this.is(m)) return f(m.value)
			return m
		}
	}
	get<A extends AnyValue<Type, U>>(m: Self<Type, U, A>) {
		return m.value
	}
	// TODO: make similar to Tag
	is<Value extends AnyValue<Type, U>>(m: U): m is Self<Type, U, Value> {
		return m.type === this._type
	}
	map<A extends AnyValue<Type, U>, B extends AnyValue<Type, U>>(
		f: (a: A) => B,
	) {
		return (
			m: Other<Type, U, A> | Self<Type, U, A>,
		): Other<Type, U, A> | Self<Type, U, B> => {
			if (this.is(m)) return this.of(f(m.value))
			return m
		}
	}
	of<Value extends AnyValue<Type, U>>(value: Value) {
		return { type: this._type, value } as Readonly<Self<Type, U, Value>>
	}
	void(_v: (U & { type: Type })['value'] extends void ? void : never) {
		return this.of(_v)
	}
}

export function union<Props>(props: {
	[K in keyof Props]: (u: unknown) => u is Props[K]
}) {
	const members: any = {}
	for (const key of Object.keys(props)) {
		members[key] = new TagClass(key)
	}
	type U = Tags<Props>
	type Members = {
		[K in keyof Props]: TagClass<U, K>
	}
	function isUnion(v: unknown): v is U {
		return (
			isTagged(v) && v.type in props && props[v.type as keyof Props](v.value)
		)
	}
	return [isUnion, members as Members] as const
}
