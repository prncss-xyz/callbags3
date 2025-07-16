export type Guard<V> = (v: unknown) => v is V
export type InferGuard<V> = V extends (v: any) => v is infer R ? R : never
import { isNumber, isString } from '@prncss-xyz/utils'

import type { Function } from '../types'

export function isArray(v: unknown) {
	if (!Array.isArray(v)) return false
}

export function isObject(v: unknown) {
	return v !== null && typeof v === 'object'
}

export function isNullish(v: unknown) {
	return v === null || v === undefined
}

export function isNonNullish(v: unknown) {
	return !isNullish(v)
}

export function isSymbol(v: unknown) {
	return typeof v === 'symbol'
}

export function isPropertyKey(v: unknown) {
	return isNumber(v) || isString(v) || isSymbol(v)
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
