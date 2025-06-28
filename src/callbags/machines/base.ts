import type {
	AnyTagged,
	Empty,
	Modify,
	Tagged,
	ValueUnion,
	Prettify,
	Tags,
} from '../../types'
import { fromInit, type Init } from '@prncss-xyz/utils'
import {
	fromSend,
	fromSender,
	type AnyExtractState,
	type Machine,
	type Send,
	type Sender,
} from './core'

// MAYBE: prevent keys not belonging to State

type Opts<Event extends AnyTagged, State extends AnyTagged, Context> = {
	[S in Exclude<State['type'], 'final'>]:
		| {
				send:
					| Partial<{
							[E in Event['type']]: Sender<
								State,
								[
									(Event & { type: E })['value'],
									(State & { type: S })['value'],
									Context,
								]
							>
					  }>
					| Sender<State, [Event, (State & { type: S })['value'], Context]>
		  }
		| { always: Sender<State, [(State & { type: S })['value']]> }
} & {
	[S in State['type']]: {
		normalize?: Modify<(State & { type: S })['value']>
		select?: Init<object, [(State & { type: S })['value']]>
	}
}

type InferNonTransitory<O extends Opts<any, any, any>> = ValueUnion<{
	[S in keyof O]: O[S] extends { always: any } ? never : S
}>

type InferResult<O extends Opts<any, any, any>> = Tags<{
	[K in InferNonTransitory<O>]: O[K] extends { select: Init<infer R, any[]> }
		? R
		: never
}>

export function baseMachine<
	Event extends AnyTagged,
	State extends AnyTagged,
	// MAYBE: Common extends Empty = Empty,
	Context = Empty,
>() {
	return function <
		O extends Opts<Event, State, Context>,
		Param = void,
		const Extract extends AnyExtractState = Tagged<'success', 'void'>,
	>(
		init: Sender<State, [Param]>,
		opts: O,
		extract?: (
			state: Prettify<State & { type: InferNonTransitory<O> }>,
		) => Send<Extract>,
	): Machine<
		Param,
		Event,
		Prettify<State & { type: InferNonTransitory<O> }>,
		Context,
		Prettify<InferResult<O>>,
		Extract
	> {
		function always(next: State): State & { type: InferNonTransitory<O> } {
			while (true) {
				const always = (opts as any)[next.type].always
				if (always) next = fromSender(always, next.value)
				else break
			}
			const normalize = (opts as any)[next.type].normalize
			if (normalize) next = normalize(next)
			return next as any
		}
		return {
			init(param) {
				return always(fromSender(init, param))
			},
			send(event, state, context) {
				const e = (opts as any)[state.type as any]?.send[event.type]
				if (!e) return state
				return always(fromSender(e, event.value, state.value, context))
			},
			getResult(state) {
				const s = (opts as any)[state.type].select
				if (s) {
					return {
						type: state.type,
						value: fromInit(s, state.value),
					}
				}
				return state as any
			},
			extract(state) {
				if (extract) return fromSend(extract(state as any))
				return { type: 'success', value: undefined } as any
			},
		}
	}
}
