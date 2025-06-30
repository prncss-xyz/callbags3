import { id, type Prettify } from '@constellar/core'
import { fromInit, type Init } from '@prncss-xyz/utils'

import type {
	AnyTagged,
	BottomRecord,
	BottomTag,
	Modify,
	Tagged,
	Tags,
	TopRecord,
} from '../../types'

import {
	type AnyExtractState,
	type Emit,
	fromSend,
	type Machine,
	type Send,
} from './core'

function merge<P extends BottomRecord, Q extends BottomRecord>(
	p: P,
	q: Q,
): P & Q {
	return { ...p, ...q }
}

type AnyTransitions<Payload, Message extends AnyTagged> = Record<
	string,
	Init<Partial<Payload>, [any, Payload, Emit<Message>]>
>

type InferInitArg<T> = T extends (e: infer E, ...args: any[]) => any ? E : void

type InferEvent<T extends AnyTransitions<any, any>> = Tags<{
	[K in keyof T]: InferInitArg<T[K]>
}>

export function directMachine<Message extends AnyTagged = BottomTag>() {
	return function <
		Payload extends TopRecord,
		Transitions extends AnyTransitions<Payload, Message>,
		Select = Payload,
		Status extends 'final' | 'pending' = 'pending',
		Extract extends AnyExtractState = Tagged<'success', Payload>,
		Param = void,
	>(
		init: Init<Payload, [Param]>,
		transitions: Transitions,
		options?: Partial<{
			getStatus: (v: Payload) => Status
			normalize: Modify<Payload>
			select: Init<Select, [Payload]>
		}>,
		extract?: (state: { type: Status; value: Payload }) => Send<Extract>,
	): Machine<
		Param,
		InferEvent<Transitions>,
		Prettify<Tagged<Status, Payload>>,
		Message,
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
			extract(s) {
				if (extract) return fromSend(extract(s))
				return { type: 'success', value: s.value } as Extract
			},
			getResult(s) {
				if (options?.select)
					return {
						type: s.type,
						value: fromInit(options.select, s.value),
					}
				return s as any
			},
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
		}
	}
}
