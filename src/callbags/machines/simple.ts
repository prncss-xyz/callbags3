import type { ContraEmpty, Empty, Modify, Tagged, Tags } from '../../types'
import { fromInit, type Init } from '@prncss-xyz/utils'
import { id, type Prettify } from '@constellar/core'
import { fromSend, type AnyExtractState, type Machine, type Send } from './core'

// MAYBE: shorcut for single value state

function merge<P extends Empty, Q extends Empty>(p: P, q: Q): P & Q {
	return { ...p, ...q }
}

type AnyTransitions<Payload, Context> = Record<
	string,
	Init<Partial<Payload>, [any, Payload, Context]>
>

type InferInitArg<T> = T extends (e: infer E, ...args: any[]) => any ? E : void

type InferEvent<T extends AnyTransitions<any, any>> = Tags<{
	[K in keyof T]: InferInitArg<T[K]>
}>

export function simpleMachine<Context = Empty>() {
	return function <
		Payload extends ContraEmpty,
		Transitions extends AnyTransitions<Payload, Context>,
		Select = Payload,
		Status extends 'final' | 'pending' = 'pending',
		Extract extends AnyExtractState = Tagged<'success', 'void'>,
		Param = void,
	>(
		init: Init<Payload, [Param]>,
		transitions: Transitions,
		options?: Partial<{
			select?: Init<Select, [Payload]>
			normalize: Modify<Payload>
			getStatus: (v: Payload) => Status
		}>,
		extract?: (state: { type: Status; value: Payload }) => Send<Extract>,
	): Machine<
		Param,
		InferEvent<Transitions>,
		Prettify<Tagged<Status, Payload>>,
		Context,
		{
			type: { type: Exclude<Status, 'error'>; value: Payload }['type']
			value: Select
		},
		Extract
	> {
		type SafeState = Tagged<Status, Payload>
		const normalize = options?.normalize ?? id
		function always(value: Payload): SafeState {
			value = normalize(value)
			const type = (
				options?.getStatus ? options.getStatus(value) : 'pending'
			) as Status
			return { type, value }
		}
		return {
			init(param) {
				return always(fromInit(init, param))
			},
			send(event, s, c) {
				if (s.type === 'final') return s 
				const value = s.value
				const t = transitions[event.type]
				if (t === undefined) return s
				return always(
					merge(s as any, fromInit(t as any, event.value, value, c)),
				)
			},
			getResult(s) {
				if (!options?.select) return s as any
				return {
					type: s.type,
					value: fromInit(options.select, s.value),
				}
			},
			extract(s) {
				if (extract) return fromSend(extract(s))
				return { type: 'success', value: s.value } as Extract
			},
		}
	}
}
