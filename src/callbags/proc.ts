import type { NonFunction } from '../types'
import type { AnyMulti, AnyPull, Pull, Source } from './sources/core'

import { isAsyncIterable, isFunction, isIterable, isPromise } from '../guards'
import { result } from './observe/result'
import { iterable, once } from './sources/pull'
import { asyncIterable, onceAsync } from './sources/push'

type Res<P extends AnyPull, V> = P extends Pull ? V : Promise<V>

export type ProSource<Value, Err, P extends AnyPull, M extends AnyMulti> =
	| AsyncIterable<Value>
	| Iterable<Value>
	| NonFunction<Value>
	| Promise<Value>
	| Source<Value, Err, P, M>

export function proc<Value, VR, M extends AnyMulti>(
	proSource: AsyncIterable<Value>,
	transform: (
		source: Source<Value, never, undefined, M>,
	) => Source<VR, never, undefined, undefined>,
): Promise<VR>
export function proc<
	Value,
	VR,
	PR extends AnyPull,
	Err,
	P extends AnyPull,
	M extends AnyMulti,
>(
	proSource: Source<Value, Err, P, M>,
	transform: (
		source: Source<Value, Err, P, M>,
	) => Source<VR, never, PR, undefined>,
): Res<PR, VR>
export function proc<Value, VR, M extends AnyMulti>(
	proSource: AsyncIterable<Value>,
	transform: (
		source: Source<Value, never, undefined, M>,
	) => Source<VR, never, undefined, undefined>,
): Promise<VR>
export function proc<Value, VR, PR extends AnyPull, M extends AnyMulti>(
	proSource: Iterable<Value>,
	transform: (
		source: Source<Value, never, Pull, M>,
	) => Source<VR, never, PR, undefined>,
): Res<PR, VR>
export function proc<Value, VR, PR extends AnyPull, M extends AnyMulti>(
	proSource: Iterable<Value>,
	transform: (
		source: Source<Value, never, Pull, M>,
	) => Source<VR, never, PR, undefined>,
): Res<PR, VR>
export function proc<
	Value,
	VR,
	PR extends AnyPull,
	Err,
	P extends AnyPull,
	M extends AnyMulti,
>(
	proSource: Source<Value, Err, P, M>,
	transform: (
		source: Source<Value, Err, P, M>,
	) => Source<VR, never, PR, undefined>,
): Res<PR, VR>
export function proc<Value, VR>(
	proSource: Promise<Value>,
	transform: (
		source: Source<Value, never, Pull, undefined>,
	) => Source<VR, never, undefined, undefined>,
): Promise<VR>
export function proc<Value, VR>(
	proSource: Promise<Value>,
	transform: (
		source: Source<Value, never, Pull, undefined>,
	) => Source<VR, never, undefined, undefined>,
): Promise<VR>
export function proc<Value, VR, PR extends AnyPull>(
	proSource: NonFunction<Value>,
	transform: (
		source: Source<Value, never, Pull, undefined>,
	) => Source<VR, never, PR, undefined>,
): Res<PR, VR>
export function proc<Value, VR, PR extends AnyPull>(
	proSource: NonFunction<Value>,
	transform: (
		source: Source<Value, never, Pull, undefined>,
	) => Source<VR, never, PR, undefined>,
): Res<PR, VR>

export function proc<
	Value,
	VR,
	PR extends AnyPull,
	P extends AnyPull,
	M extends AnyMulti,
>(
	proSource: ProSource<Value, never, P, M>,
	transform: (
		source: Source<Value, never, P, M>,
	) => Source<VR, never, PR, undefined>,
): any {
	let source: any
	if (isFunction(proSource)) source = proSource
	else if (isAsyncIterable(proSource)) source = asyncIterable(proSource)
	else if (isIterable(proSource)) source = iterable(proSource)
	else if (isPromise(proSource)) source = onceAsync(proSource)
	else source = once(proSource)
	return result()(transform(source))
}
