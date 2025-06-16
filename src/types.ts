export type Prettify<T> = {
	[K in keyof T]: T[K]
} & {}

export type NonFunction<T> = T extends (...args: any[]) => any ? never : T
export type Function<T> = T extends (...args: any[]) => never ? any : T
