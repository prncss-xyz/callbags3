export type Guarded<V> = V extends (v: any) => v is infer T ? T : never
import type { Function } from './types'

export function isNullish(v: unknown): v is null | undefined {
	return v === null || v === undefined
}

export function isVoid(v: unknown): v is void {
	return v === undefined
}

export function isUnknown(_v: unknown): _v is unknown {
	return true
}

export function isIterable<Value>(v: unknown): v is Iterable<Value> {
	return v !== null && typeof v === 'object' && Symbol.iterator in v
}

export function isAsyncIterable<Value>(v: unknown): v is AsyncIterable<Value> {
	return v !== null && typeof v === 'object' && Symbol.asyncIterator in v
}

export function isFunction<T>(v: unknown): v is Function<T> {
	return typeof v === 'function'
}

// source: https://blog.ndpsoftware.com/2023/05/is-promise
export function isPromise<T = unknown>(
	obj: unknown,
): obj is T extends { then: (...args: unknown[]) => unknown }
	? Promise<Awaited<T>>
	: never {
	return (
		!!obj &&
		(typeof obj === 'object' || typeof obj === 'function') &&
		typeof (obj as any).then === 'function'
	)
}
