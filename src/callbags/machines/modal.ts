import { fromInit, type Init } from '@prncss-xyz/utils'

import type { AnyTagged, Tagged, Tags, ValueFor } from '../../tags'
import type {
	BottomRecord,
	Dedupe,
	Modify,
	Prettify,
	ValueUnion,
} from '../../types'
import type { SubMachineEntry } from './sub'

import {
	just,
	type Just,
	type Maybe,
	nothing,
	type Nothing,
} from '../../errors/maybe'
import {
	type AnyFinalState,
	fromSender,
	type Machine,
	type Sender,
} from './core'

// TODO: prevent init from sending to always
// MAYBE: prevent keys not belonging to State

type Transitions<
	Event extends AnyTagged,
	State extends AnyTagged,
	Context extends BottomRecord,
> = {
	[S in Exclude<State['type'], 'final'>]:
		| SubMachineEntry<State, S, Event, Context, any, any>
		| {
				always: Sender<State, [ValueFor<State, S>, Context]>
		  }
		| {
				send:
					| Partial<{
							[E in Event['type']]: Sender<
								State,
								[ValueFor<Event, E>, ValueFor<State, S>, Context]
							>
					  }>
					| Sender<State, [Event, ValueFor<State, S>, Context]>
		  }
} & {
	[S in State['type']]: {
		normalize?: Modify<ValueFor<State, S>>
		select?: Init<object, [ValueFor<State, S>]>
	}
}

type InferNonTransitory<O extends Transitions<any, any, any>> = ValueUnion<{
	[S in keyof O]: O[S] extends { always: any } ? never : S
}>

type InferResult<O extends Transitions<any, any, any>> = Tags<{
	[K in InferNonTransitory<O>]: O[K] extends { select: Init<infer R, any[]> }
		? R
		: never
}>

type InferStateFromSender<O extends Transitions<any, any, any>> = Dedupe<
	| ValueUnion<{
			[K in InferNonTransitory<O>]: O[K] extends Record<
				'always',
				Init<infer R, any[]>
			>
				? R
				: never
	  }>
	| ValueUnion<{
			[K in InferNonTransitory<O>]: O[K] extends Record<
				'send',
				Init<infer R, any[]> | Record<PropertyKey, Init<infer R, any[]>>
			>
				? R
				: never
	  }>
>

export function modalMachine<
	Event extends AnyTagged,
	State extends AnyTagged,
	Context extends BottomRecord = BottomRecord,
>() {
	return function <
		T extends Transitions<Event, State, Context>,
		Param = void,
		Exit extends Maybe<unknown> =
			| (State extends AnyFinalState ? Just<ValueFor<State, 'final'>> : never)
			| Tagged<'nothing', void>,
	>(
		init: Sender<State, [Param]>,
		transitions: T,
		exit?: (v: ValueFor<State, 'final'>) => Exit,
	): Machine<
		Param,
		Prettify<Event>,
		// Prettify<State & { type: InferNonTransitory<T> }>,
		Prettify<InferStateFromSender<T> & { type: InferNonTransitory<T> }>,
		Context,
		Prettify<InferResult<T>>,
		Exit | Nothing
	> {
		function normalize(next: State) {
			const normalize = (transitions as any)[next.type].normalize
			if (normalize) next = normalize(next)
			return next
		}
		function always(
			next: State,
			context: Context,
		): State & { type: InferNonTransitory<T> } {
			while (true) {
				const always = (transitions as any)[next.type].always
				if (always) next = fromSender(always, next.value, context)
				else break
			}
			return normalize(next) as any
		}
		return {
			exit(state: any) {
				if (state.type !== 'final') return nothing.void()
				if (!exit) return just.of(state.value) as any
				return exit(state.value)
			},
			getResult(state: any) {
				const s = (transitions as any)[state.type].select
				if (s) {
					return {
						type: state.type,
						value: fromInit(s, state.value),
					}
				}
				return state as any
			},
			init(param) {
				return normalize(fromSender(init, param)) as never
			},
			send(event, state: any, context) {
				const e = (transitions as any)[state.type as any]?.send[event.type]
				if (!e) return state as any
				return always(fromSender(e, event.value, state.value, context), context)
			},
		}
	}
}
