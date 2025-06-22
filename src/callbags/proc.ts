import { isAsyncIterable, isFunction, isIterable, isPromise } from '../guards'
import { result } from './observe/result'
import type { AnyMulti, AnyPull, Pull, Source } from './sources/core'
import { iterable, once } from './sources/pull'
import { asyncIterable, onceAsync } from './sources/push'
import type { NonFunction } from '../types'

type Res<P extends AnyPull, V> = P extends Pull ? V : Promise<V>

export type ProSource<
	Value,
	Index,
	Err,
	P extends AnyPull,
	M extends AnyMulti,
> =
	| Iterable<Value>
	| AsyncIterable<Value>
	| NonFunction<Value>
	| Promise<Value>
	| Source<Value, Index, Err, P, M>

export function proc<Value, VR, Context, M extends AnyMulti>(
	proSource: AsyncIterable<Value>,
	transform: (
		source: Source<Value, Context, never, undefined, M>,
	) => Source<VR, Context, never, undefined, undefined>,
	context: Context,
): Promise<VR>
export function proc<
	Value,
	VR,
	PR extends AnyPull,
	Err,
	P extends AnyPull,
	M extends AnyMulti,
>(
	proSource: Source<Value, void, Err, P, M>,
	transform: (
		source: Source<Value, void, Err, P, M>,
	) => Source<VR, void, never, PR, undefined>,
): Res<PR, VR>
export function proc<Value, VR, M extends AnyMulti>(
	proSource: AsyncIterable<Value>,
	transform: (
		source: Source<Value, void, never, undefined, M>,
	) => Source<VR, void, never, undefined, undefined>,
): Promise<VR>
export function proc<Value, VR, Context, PR extends AnyPull, M extends AnyMulti>(
	proSource: Iterable<Value>,
	transform: (
		source: Source<Value, Context, never, Pull, M>,
	) => Source<VR, Context, never, PR, undefined>,
	context: Context,
): Res<PR, VR>
export function proc<Value, VR, PR extends AnyPull, M extends AnyMulti>(
	proSource: Iterable<Value>,
	transform: (
		source: Source<Value, void, never, Pull, M>,
	) => Source<VR, void, never, PR, undefined>,
): Res<PR, VR>
export function proc<
	Value,
	VR,
	Context,
	PR extends AnyPull,
	Err,
	P extends AnyPull,
	M extends AnyMulti,
>(
	proSource: Source<Value, Context, Err, P, M>,
	transform: (
		source: Source<Value, Context, Err, P, M>,
	) => Source<VR, Context, never, PR, undefined>,
	context: Context,
): Res<PR, VR>
export function proc<Value, VR, Context>(
	proSource: Promise<Value>,
	transform: (
		source: Source<Value, Context, never, Pull, undefined>,
	) => Source<VR, Context, never, undefined, undefined>,
	context: Context,
): Promise<VR>
export function proc<Value, VR>(
	proSource: Promise<Value>,
	transform: (
		source: Source<Value, void, never, Pull, undefined>,
	) => Source<VR, void, never, undefined, undefined>,
): Promise<VR>
export function proc<Value, VR, Context, PR extends AnyPull>(
	proSource: NonFunction<Value>,
	transform: (
		source: Source<Value, Context, never, Pull, undefined>,
	) => Source<VR, Context, never, PR, undefined>,
	context: Context,
): Res<PR, VR>
export function proc<Value, VR, PR extends AnyPull>(
	proSource: NonFunction<Value>,
	transform: (
		source: Source<Value, void, never, Pull, undefined>,
	) => Source<VR, void, never, PR, undefined>,
): Res<PR, VR>

export function proc<
	Value,
	VR,
	PR extends AnyPull,
	P extends AnyPull,
	M extends AnyMulti,
	Context,
>(
	proSource: ProSource<Value, Context, never, P, M>,
	transform: (
		source: Source<Value, Context, never, P, M>,
	) => Source<VR, Context, never, PR, undefined>,
	context: Context = undefined as any,
): any {
	let source: any
	if (isFunction(proSource)) source = proSource
	else if (isAsyncIterable(proSource)) source = asyncIterable(proSource)
	else if (isIterable(proSource)) source = iterable(proSource)
	else if (isPromise(proSource)) source = onceAsync(proSource)
	else source = once(proSource)
	return result(context)(transform(source))
}
