export type Prettify<T> = {
	[K in keyof T]: T[K]
} & {}

export type Modify<T> = (t: T) => T

export type NonEmptyArray<T> = [T, ...T[]]
export type Function = (...args: any[]) => any
export type NonFunction<T> = T extends Function ? never : T

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

export type TopRecord = Record<PropertyKey, unknown>
export type BottomRecord = Record<never, never>

type NonVoidKeys<T> = { [K in keyof T]: T[K] extends void ? never : K }[keyof T]
export type NonVoidObject<T> = { [K in NonVoidKeys<T>]: T[K] }

// https://stackoverflow.com/questions/74697633/how-does-one-deduplicate-a-union
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
	k: infer I,
) => void
	? I
	: never

type LastOf<T> =
	UnionToIntersection<T extends any ? () => T : never> extends () => infer R
		? R
		: never

export type Dedupe<
	T,
	L = LastOf<T>,
	N = [T] extends [never] ? true : false,
> = true extends N ? never : Dedupe<Exclude<T, L>> | L
