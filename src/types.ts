export type Prettify<T> = {
	[K in keyof T]: T[K]
} & {}

export type Modify<T> = (value: T) => T

export type NonEmptyArray<T> = [T, ...T[]]
export type NonFunction<T> = T extends (...args: any[]) => any ? never : T
export type Function<T> = T extends (...args: any[]) => never ? any : T

export type Values<T> = T[keyof T]

// Type of the intersection of the values
export type Intersection<T extends any[]> = {
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
export type Tags<T> = Prettify<Values<{ [K in keyof T]: Tagged<K, T[K]> }>>
export type CTagged<Type extends PropertyKey, Value> = Value extends never
	? never
	: Tagged<Type, Value>
export type Singleton<Type extends PropertyKey> = { type: Type; value: void }
export type AnyTagged = Tagged<PropertyKey, unknown>

export type SingletonKeys<T extends AnyTagged> =
	T extends Tagged<infer K, void> ? K : never

export type DeepRecord<Key extends PropertyKey, Value> = {
	[K in Key]: Value | DeepRecord<K, Value>
}

export type Empty = Record<PropertyKey, never>
