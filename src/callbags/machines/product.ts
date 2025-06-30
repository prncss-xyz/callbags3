import { fromInit, type Init } from '@prncss-xyz/utils'

import type {
	AnyTagged,
	BottomTag,
	Modify,
	Prettify,
	Tagged,
	Tags,
} from '../../types'

import {
	type AnyExtractState,
	type AnyMachine,
	type Emit,
	fromSend,
	type Machine,
	type Send,
} from './core'

// MAYBE: shortcut for single value state

type AnySlices = Record<PropertyKey, AnyMachine>
type InferParams<T extends AnySlices> = Prettify<{
	[K in keyof T]: T[K] extends Machine<infer P, any, any, any, any, any>
		? P
		: never
}>

type InferResult<T extends AnySlices> = Prettify<{
	[K in keyof T]: T[K] extends Machine<any, any, any, any, infer R, any>
		? R
		: never
}>

type InferState<T extends AnySlices> = Prettify<{
	[K in keyof T]: T[K] extends Machine<any, any, infer S, any, any, any>
		? S
		: never
}>

type InferProductEvents<Slices> = Tags<{
	[K in keyof Slices]: Slices[K] extends Machine<
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
		? (V extends void ? object : { value: V }) & { event: E; machine: M }
		: never

export function productMachine<Message extends AnyTagged = BottomTag>() {
	return function <
		Param,
		Slices extends Record<
			PropertyKey,
			Machine<any, any, any, Message, any, any>
		>,
		Select = InferResult<Slices>,
		Extract extends AnyExtractState = Tagged<'success', 'void'>,
		Passthrough extends boolean = false,
	>(
		slices: Slices,
		init: Init<InferParams<Slices>, [Param]>,
		transitions: (
			chain: (
				init: Init<
					Collapse<InferProductEvents<Slices>>[],
					[InferResult<Slices>]
				>,
			) => Modify<InferState<Slices>>,
			emit: Emit<Message>,
		) => Record<string, (e: any) => Modify<InferState<Slices>>>,
		options?: Partial<{
			passthrough: Passthrough
			select: Init<Select, [InferResult<Slices>]>
		}>,
		extract?: (state: InferState<Slices>) => Send<Extract>,
	) {
		function getResult(s: InferState<Slices>): InferResult<Slices> {
			const res: any = {}
			for (const [k, m] of Object.entries(slices)) {
				res[k] = m.getResult(s[k])
			}
			if (options?.select) return fromInit(options.select, res) as any
			return res
		}
		return {
			extract(s: InferState<Slices>) {
				if (extract) return fromSend(extract(s))
				return { type: 'success', value: undefined } as Extract
			},
			getResult,
			init: (param: Param) => {
				const params = fromInit(init, param)
				return Object.fromEntries(
					Object.entries(slices).map(([k, m]) => [k, m.init(params)]),
				)
			},
			send: (
				e: InferProductEvents<Slices>,
				s: InferState<Slices>,
				emit: Emit<Message>,
			) => {
				function chain(
					init: Init<
						Collapse<InferProductEvents<Slices>>[],
						[InferResult<Slices>]
					>,
				) {
					return function (state: InferState<Slices>) {
						const nextState = state
						let dirty = false
						for (const event of fromInit(init, getResult(state))) {
							const localState = state[event.machine]
							const res = slices[event.machine].send(
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
					for (const [k, m] of Object.entries(slices)) {
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
