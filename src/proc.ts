import { isAsyncIterable, isFunction, isIterable, isPromise } from './guards'
import { result } from './observe/result'
import type { AnyMulti, AnyPull, Multi, Pull, Source } from './sources/core'
import { iterable, once } from './sources/pull'
import { asyncIterable, onceAsync } from './sources/push'
import type { NonFunction } from './types'

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

export function proc<Value, VR, IR>(
	proSource: AsyncIterable<Value>,
	transform: (
		source: Source<Value, number, never, undefined, Multi>,
	) => Source<VR, IR, never, undefined, undefined>,
): Promise<VR>
export function proc<Value, VR, IR, PR extends AnyPull>(
	proSource: Iterable<Value>,
	transform: (
		source: Source<Value, number, never, Pull, Multi>,
	) => Source<VR, IR, never, PR, undefined>,
): Res<PR, VR>
export function proc<
	Value,
	VR,
	IR,
	PR extends AnyPull,
	Index,
	Err,
	P extends AnyPull,
	M extends AnyMulti,
>(
	proSource: Source<Value, Index, Err, P, M>,
	transform: (
		source: Source<Value, Index, Err, P, M>,
	) => Source<VR, IR, never, PR, undefined>,
): Res<PR, VR>
export function proc<Value, VR, IR>(
	proSource: Promise<Value>,
	transform: (
		source: Source<Value, void, never, Pull, undefined>,
	) => Source<VR, IR, never, undefined, undefined>,
): Promise<VR>
export function proc<Value, VR, IR, PR extends AnyPull>(
	proSource: NonFunction<Value>,
	transform: (
		source: Source<Value, void, never, Pull, undefined>,
	) => Source<VR, IR, never, PR, undefined>,
): Res<PR, VR>
export function proc<
	Value,
	VR,
	IR,
	Index,
	PR extends AnyPull,
	P extends AnyPull,
	M extends AnyMulti,
>(
	proSource: ProSource<Value, Index, never, P, M>,
	transform: (
		source: Source<Value, Index, never, P, M>,
	) => Source<VR, IR, never, PR, undefined>,
): any {
	let source: any
	if (isFunction(proSource)) source = proSource
	else if (isAsyncIterable(proSource)) source = asyncIterable(proSource)
	else if (isIterable(proSource)) source = iterable(proSource)
	else if (isPromise(proSource)) source = onceAsync(proSource)
	else source = once(proSource)
	return result()(transform(source))
}
