export type Prettify<T> = {
	[K in keyof T]: T[K]
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

export type TopRecord = Record<PropertyKey, unknown>
export type BottomRecord = Record<never, never>

type NonVoidKeys<T> = { [K in keyof T]: T[K] extends void ? never : K }[keyof T]
export type NonVoidObject<T> = { [K in NonVoidKeys<T>]: T[K] }
