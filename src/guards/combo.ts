import type { Prettify, Tags, ValueIntersection } from '../types'

import { type Guard, isNullish, isObject } from './primitives'

export function refine<T>(g: Guard<T>, ...fns: ((v: T) => unknown)[]) {
	return function (v: unknown): v is T {
		if (!g(v)) return false
		for (const fn of fns) {
			if (!fn(v)) return false
		}
		return true
	}
}

export function isOneOf<const T extends any[]>(...values: T) {
	return function (v: unknown): v is T[number] {
		return values.includes(v)
	}
}

export function isOptional<T>(fn: Guard<T>) {
	return function (v: unknown): v is null | T | undefined {
		if (isNullish(v)) return true
		return fn(v)
	}
}

type IsObj<T> = { [K in keyof T]: (v: unknown) => v is T[K] }

export function isPartial<T>(o: IsObj<T>) {
	return function (v: unknown): v is T {
		if (!isObject(v)) return false
		for (const [k, g] of Object.entries<Guard<any>>(o)) {
			if (k in v) {
				const p = (v as any)[k]
				if (isNullish(p) || g(p)) continue
				return false
			}
		}
		return true
	}
}

export function isObjectOf<T>(o: IsObj<T>) {
	return function (v: unknown): v is T {
		if (!isObject(v)) return false
		for (const [k, g] of Object.entries<Guard<any>>(o)) {
			if (k in v && g((v as any)[k])) continue
			return false
		}
		return true
	}
}

export function isTag<T>(o: IsObj<T>) {
	return function (v: unknown): v is Tags<T> {
		if (!isObject(v)) return false
		const type = (v as any).type
		if (type === undefined) return false
		const val = (o as any)[type]
		if (val === undefined) return false
		return val((v as any).value)
	}
}

export function isSome<Args extends any[]>(...fns: IsObj<Args>) {
	return function (v: unknown): v is Args[number] {
		for (const fn of fns) {
			if (fn(v)) return true
		}
		return false
	}
}

export function isAll<Args extends any[]>(...fns: IsObj<Args>) {
	return function (v: unknown): v is Prettify<ValueIntersection<Args>> {
		for (const fn of fns) {
			if (!fn(v)) return false
		}
		return true
	}
}

export function isArrayOf<T>(fn: (v: unknown) => v is T) {
	return function (v: unknown): v is T[] {
		if (!Array.isArray(v)) return false
		for (const e of v) {
			if (!fn(e)) return false
		}
		return true
	}
}

export function isRecordOf<K extends PropertyKey, V>(
	isKey: Guard<K>,
	isValue: Guard<V>,
) {
	return function (v: unknown): v is Record<K, V> {
		if (!isObject(v)) return false
		for (const [k, val] of Object.entries(v)) {
			if (!isKey(k) || !isValue(val)) return false
		}
		return true
	}
}

export function isSetOf<T>(isValue: Guard<T>) {
	return function (v: unknown): v is Set<T> {
		if (!(v instanceof Set)) return false
		for (const val of v) {
			if (!isValue(val)) return false
		}
		return true
	}
}

export function isMapOf<K, V>(isKey: Guard<K>, isValue: Guard<V>) {
	return function (v: unknown): v is Map<K, V> {
		if (!(v instanceof Map)) return false
		for (const [k, val] of v) {
			if (!isKey(k)) return false
			if (!isValue(val)) return false
		}
		return true
	}
}
