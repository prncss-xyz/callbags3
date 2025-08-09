import type { Prettify } from '../../types'

export type MergeContext<A, B> = {
	[K in keyof A]: { [K2 in K & keyof B]: Merge<A[K2], B[K2]> }
}

type Merge<A, B> = A extends B
	? B extends A
		? A & B
		: PrettyArgs<MergeFns<A, B>>
	: PrettyArgs<MergeFns<A, B>>

type MergeFns<A, B> = A extends (args: infer ArgsA) => infer RA
	? B extends (args: infer ArgsB) => infer RB
		? (args: ArgsA | ArgsB) => RA & RB
		: never
	: never

type PrettyArgs<T> = T extends (args: infer Args) => infer R
	? (args: Prettify<Args>) => R
	: never
