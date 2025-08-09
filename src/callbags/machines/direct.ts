import { id } from '@constellar/core'
import { fromInit, type Init } from '@prncss-xyz/utils'

import type { Tags } from '../../tags'
import type { BottomRecord, Modify, TopRecord } from '../../types'

import { type Maybe, nothing, type Nothing } from '../../errors'
import { type Machine } from './core'

function merge<P extends BottomRecord, Q extends BottomRecord>(
	p: P,
	q: Q,
): P & Q {
	return { ...p, ...q }
}

type AnyTransitions<Payload, Context extends BottomRecord> = Record<
	string,
	Init<Partial<Payload>, [any, Payload, Context]>
>

type InferInitArg<T> = T extends (e: infer E, ...args: any[]) => any ? E : void

type InferEvent<T extends AnyTransitions<any, any>> = Tags<{
	[K in keyof T]: InferInitArg<T[K]>
}>

export function directMachine<Context extends BottomRecord = BottomRecord>() {
	return function <
		Payload extends TopRecord,
		Transitions extends AnyTransitions<Payload, Context>,
		Result = Payload,
		Exit extends Maybe<unknown> = Nothing,
		Param = void,
	>(
		init: Init<Payload, [Param]>,
		transitions: Transitions,
		opts?: Partial<{
			exit: (v: Payload) => Exit
			normalize: Modify<Payload>
			result: Init<Result, [Payload]>
		}>,
	): Machine<Param, InferEvent<Transitions>, Payload, Context, Result, Exit> {
		const normalize = opts?.normalize ?? id
		const exit = opts?.exit ?? (nothing.void.bind(nothing) as never)
		const getResult = opts?.result
			? (s: any) => fromInit(opts.result!, s)
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
