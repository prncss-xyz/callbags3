import type { Empty, Modify, Prettify, Tagged, Tags } from '../../types'
import { fromInit, type Init } from '@prncss-xyz/utils'
import {
	fromSend,
	type AnyExtractState,
	type AnyMachine,
	type Machine,
	type Send,
} from './core'

// MAYBE: shortcut for single value state

type AnySlices = Record<string, AnyMachine>
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
		? { machine: M; event: E } & (V extends void ? {} : { value: V })
		: never

export function productMachine<Context = Empty>() {
	return function <
		Param,
		Slices extends Record<string, Machine<any, any, any, Context, any, any>>,
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
			context: Context,
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
			init: (param: Param) => {
				const params = fromInit(init, param)
				return Object.fromEntries(
					Object.entries(slices).map(([k, m]) => [k, m.init(params)]),
				)
			},
			send: (e: any, s: InferState<Slices>, context: Context) => {
				function chain(
					init: Init<
						Collapse<InferProductEvents<Slices>>[],
						[InferResult<Slices>]
					>,
				) {
					return function (state: InferState<Slices>) {
						for (const event of fromInit(init, getResult(state))) {
							const res = slices[event.machine as string].send(
								{
									type: event.event,
									value: event.value,
								},
								state,
								context,
							)
              if (res !== state[])
						}
						return state
					}
				}
				const t = transitions(chain, context)
				if (e.type in t) {
					for (const [{ machine, event, value }] of Object.entries(slices)) {
						const res = m.send(e, s[k], context)
						if (res !== s[k]) s = { ...s, [k]: res }
					}
				}
				if (options?.passthrough) {
					for (const [k, m] of Object.entries(slices)) {
						const res = m.send(e, s[k], context)
						if (res !== s[k]) s = { ...s, [k]: res }
					}
				}
				// TODO:
				return s
			},
			getResult,
			extract(s: InferState<Slices>) {
				if (extract) return fromSend(extract(s))
				return { type: 'success', value: undefined } as Extract
			},
		}
	}
}
