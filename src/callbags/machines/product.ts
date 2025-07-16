import { fromInit, type Init } from '@prncss-xyz/utils'

import type { UnwrapMaybe } from '../../errors/maybe/unwrap'
// TODO: exit
import type { AnyTagged, BottomTag, Tagged, Tags } from '../../tags'
import type { Modify, NonVoidObject, Prettify } from '../../types'

import { just, nothing } from '../../errors'
import { type AnyMachine, type Emit, type Machine } from './core'

// MAYBE: shortcut for single value state

type AnyProduct = Record<PropertyKey, AnyMachine>
type InferParams<T extends AnyProduct> = Prettify<
	NonVoidObject<{
		[K in keyof T]: T[K] extends Machine<infer P, any, any, any, any, any>
			? P extends void
				? void
				: P
			: never
	}>
>

type InferResult<T extends AnyProduct> = Prettify<{
	[K in keyof T]: T[K] extends Machine<any, any, any, any, infer R, any>
		? R
		: never
}>

type InferState<T extends AnyProduct> = Prettify<{
	[K in keyof T]: T[K] extends Machine<any, any, infer S, any, any, any>
		? S
		: never
}>

type InferExit<T extends AnyProduct> = UnwrapMaybe<{
	[K in keyof T]: T[K] extends Machine<any, any, any, any, any, infer E>
		? E
		: never
}>

type InferProductEvents<Product> = Tags<{
	[K in keyof Product]: Product[K] extends Machine<
		any,
		infer E,
		any,
		any,
		any,
		any
	>
		? E
		: never
}>

type Collapse<T> =
	T extends Tagged<infer M, Tagged<infer E, infer V>>
		? (V extends void ? object : { value: V }) & {
				event: E
				machine: M
			}
		: never

// TODO: slices
export function productMachine<Message extends AnyTagged = BottomTag>() {
	return function <
		Param,
		Product extends Record<
			PropertyKey,
			Machine<any, any, any, Message, any, any>
		>,
		Select = InferResult<Product>,
		Passthrough extends boolean = false,
	>(
		product: Product,
		init: Init<InferParams<Product>, [Param]>,
		transitions: (
			chain: (
				init: Init<
					Collapse<InferProductEvents<Product>>[],
					[InferResult<Product>]
				>,
			) => Modify<InferState<Product>>,
			emit: Emit<Message>,
		) => Record<string, (e: any) => Modify<InferState<Product>>>,
		options?: Partial<{
			passthrough: Passthrough
			select: Init<Select, [InferResult<Product>]>
		}>,
	): Machine<
		InferParams<Product>,
		InferProductEvents<Product>,
		InferState<Product>,
		Message,
		InferResult<Product>,
		InferExit<Product>
	> {
		function getResult(s: InferState<Product>): InferResult<Product> {
			const res: any = {}
			for (const [k, m] of Object.entries(product)) {
				res[k] = m.getResult(s[k])
			}
			if (options?.select) return fromInit(options.select, res) as any
			return res
		}
		return {
			exit(state) {
				const res: any = {}
				for (const [k, m] of Object.entries(product)) {
					res[k] = m.exit(state[k])
					if (nothing.is(res[k])) return nothing.void() as any
				}
				return just.of(res)
			},
			getResult,
			init: (param) =>
				Object.fromEntries(
					Object.entries(product).map(([k, m]) => [
						k,
						m.init(fromInit(init, param as any)),
					]),
				) as any,
			send: (
				e: InferProductEvents<Product>,
				s: InferState<Product>,
				emit: Emit<Message>,
			) => {
				function chain(
					init: Init<
						Collapse<InferProductEvents<Product>>[],
						[InferResult<Product>]
					>,
				) {
					return function (state: InferState<Product>) {
						const nextState = state
						let dirty = false
						for (const event of fromInit(init, getResult(state))) {
							const localState = state[event.machine]
							const res = product[event.machine].send(
								{
									type: event.event,
									value: event.value,
								},
								localState,
								emit,
							)
							if (res !== localState) {
								;(nextState as any)[event.machine] = res
								dirty = true
							}
						}
						return dirty ? nextState : state
					}
				}
				const t = transitions(chain, emit)
				if (e.type in t) {
					return t[e.type as any](e.value)(s)
				}
				if (options?.passthrough) {
					let dirty = false
					let next = s
					for (const [k, m] of Object.entries(product)) {
						const res = m.send(e, next[k], emit)
						if (res !== next[k]) {
							dirty = true
							next = { ...next, [k]: res }
						}
					}
					return dirty ? next : s
				}
				return s
			},
		}
	}
}
