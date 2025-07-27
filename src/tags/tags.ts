import { isUnknown, isVoid } from '../guards'
import { type AnyTagged, type Tagged } from './core'

class Tag<Type extends PropertyKey, Domain> {
	public readonly _isValue
	private readonly _type
	constructor(type: Type, isValue?: (v: unknown) => v is Domain) {
		this._type = type
		this._isValue = isValue ?? (isUnknown as never)
	}
	get<V extends Domain>(m: Tagged<Type, V>) {
		return m.value
	}
	is(m: AnyTagged) {
		return this.isType(m) && this.isValue(m)
	}
	isType<Value>(m: Tagged<PropertyKey, Value>): m is Tagged<Type, Value> {
		return m.type === this._type
	}
	isValue(m: Tagged<Type, unknown>): m is Tagged<Type, Domain> {
		return this._isValue(m.value)
	}
	map<A extends Domain, B extends Domain>(fn: (a: A) => B) {
		return (m: Tagged<Type, A>) => {
			return this.of(fn(this.get(m)))
		}
	}
	of<V extends Domain>(value: V) {
		return { type: this._type, value } as Readonly<Tagged<Type, V>>
	}
	void(_v: Domain extends void ? void : never) {
		return this.of(_v as any)
	}
}

export function createTag<const Type extends PropertyKey, Value>(
	type: Type,
	isValue: (v: unknown) => v is Value = isUnknown as any,
) {
	return new Tag(type, isValue)
}

export function singleton<const Type extends PropertyKey>(type: Type) {
	return new Tag(type, isVoid)
}
