import type {
	ContraEmpty,
	Empty,
	Modify,
	Prettify2,
	Tagged,
	Tags,
} from '../../types'
import { fromInit, type Init } from '@prncss-xyz/utils'
import { id, type Prettify } from '@constellar/core'
import {
	fromSend,
	type AnyErrorState,
	type AnyFinalState,
	type Machine,
	type Send,
} from './core'

// TODO: merge
// TODO: Prettify2
// MAYBE: shorcut for single value state

function merge<P extends Empty, Q extends Empty>(p: P, q: Q): P & Q {
	return { ...p, ...q }
}

type AnyTransitions<State, Context> = Record<
	string,
	Init<Partial<State>, [any, State, Context]>
>

type InferInitArg<T> = T extends (e: infer E, ...args: any[]) => any ? E : void

type InferEvent<T extends AnyTransitions<any, any>> = Tags<{
	[K in keyof T]: InferInitArg<T[K]>
}>

export function simpleMachine<Context = Empty>() {
	return function <
		Value extends ContraEmpty,
		Transitions extends AnyTransitions<Value, Context>,
		Select = Value,
		Status extends Tagged<'pending' | 'success', void> | AnyErrorState = Tagged<
			'pending',
			void
		>,
		Extract extends AnyFinalState = Tagged<'success', 'void'>,
		Param = void,
	>(
		init: Init<Value, [Param]>,
		transitions: Transitions,
		options?: Partial<{
			select?: Init<Select, [Value]>
			normalize: Modify<Value>
			getStatus: (v: Value) => Send<Status>
		}>,
		extract?: (state: {
			type: Exclude<Status['type'], 'error'>
			value: Value
		}) => Send<Extract>,
	): Machine<
		Param,
		InferEvent<Transitions>,
		Prettify<Tagged<Exclude<Status['type'], 'error'>, Value>>,
		Prettify<Status & AnyErrorState>,
		Context,
		{
			type: { type: Exclude<Status['type'], 'error'>; value: Value }['type']
			value: Select
		},
		Extract
	> {
		type SafeState = Tagged<Exclude<Status['type'], 'error'>, Value>
		type ErrState = Status & AnyErrorState
		const normalize = options?.normalize ?? id
		function always(value: Value): SafeState | ErrState {
			value = normalize(value)
			let status: Status
			if (options?.getStatus) status = fromSend(options.getStatus(value))
			else status = { type: 'pending', value: undefined } as any
			const type = status.type as Status['type']
			if (type === 'error') return status as Status & Tagged<'error', unknown>
			return { type: type as Exclude<Status['type'], 'error'>, value }
		}
		return {
			init(param) {
				return always(fromInit(init, param))
			},
			send(event, s, c) {
				if (s.type !== 'pending') return s
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
				if (extract) return fromSend(extract(s as any)) as any
				return { type: 'success', value: s.value }
			},
		}
	}
}
