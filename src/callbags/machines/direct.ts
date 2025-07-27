import { id } from '@constellar/core'
import { fromInit, type Init } from '@prncss-xyz/utils'

import type { AnyTagged, BottomTag, Tags } from '../../tags'
import type { BottomRecord, Modify, TopRecord } from '../../types'

import { type Maybe, nothing, type Nothing } from '../../errors'
import { type Emit, type Machine } from './core'

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
		Result = Payload,
		Exit extends Maybe<unknown> = Nothing,
		Param = void,
	>(
		init: Init<Payload, [Param]>,
		transitions: Transitions,
		options?: Partial<{
			exit: (v: Payload) => Exit
			normalize: Modify<Payload>
			result: Init<Result, [Payload]>
		}>,
	): Machine<Param, InferEvent<Transitions>, Payload, Message, Result, Exit> {
		const normalize = options?.normalize ?? id
		const exit = options?.exit ?? (nothing.void.bind(nothing) as never)
		const getResult = options?.result
			? (s: any) => fromInit(options.result!, s)
			: (id as never)
		return {
			exit,
			getResult,
			init(param) {
				return normalize(fromInit(init, param))
			},
			send(event, s, c) {
				if (s.type === 'final') return s
				const t = transitions[event.type]
				if (t === undefined) return s

				return normalize(merge(s as any, fromInit(t as any, event.value, s, c)))
			},
		}
	}
}
