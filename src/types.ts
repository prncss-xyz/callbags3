export type Prettify<T> = {
	[K in keyof T]: T[K]
} & {}

export type Prettify2<T> = {
	[K in keyof T]: Prettify<T[K]>
} & {}

export type Modify<T> = (value: T) => T

export type NonEmptyArray<T> = [T, ...T[]]
export type NonFunction<T> = T extends (...args: any[]) => any ? never : T
export type Function<T> = T extends (...args: any[]) => never ? any : T

export type ValueUnion<T> = T[keyof T]
// Type of the intersection of the values
export type ValueIntersection<T> = {
	[K in keyof T]: (x: T[K]) => void
} extends {
	[K: PropertyKey]: (x: infer I) => void
}
	? I
	: never

export type Init<Res, Args extends any[] = []> =
	| ((...args: Args) => Res)
	| NonFunction<Res>

export type Tagged<Type extends PropertyKey, Value> = {
	type: Type
	value: Value
}
export type Tags<T, S = unknown> = Prettify<
	ValueUnion<{ [K in keyof T]: Tagged<K, Prettify<T[K] & S>> }>
>
export type UnTags<T extends AnyTagged> = {
	[K in T['type']]: (T & { type: K })['value']
}

export type Singleton<Type extends PropertyKey> = { type: Type; value: void }
export type AnyTagged = Tagged<PropertyKey, unknown>

export type SingletonKeys<T extends AnyTagged> =
	T extends Tagged<infer K, void> ? K : never

export type Empty = Record<PropertyKey, never>
export type ContraEmpty = Record<PropertyKey, unknown>
