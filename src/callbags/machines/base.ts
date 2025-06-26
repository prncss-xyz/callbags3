import type {
	AnyTagged,
	Empty,
	Modify,
	Tagged,
	ValueUnion,
	Prettify,
	Prettify2,
} from '../../types'
import { fromInit, type Init } from '@prncss-xyz/utils'
import {
	fromSend,
	fromSender,
	type AnyErrorState,
	type AnyFinalState,
	type Final,
	type Machine,
	type Send,
	type Sender,
} from './core'

// MAYBE: prevent keys not belonging to State

type Opts<Event extends AnyTagged, State extends AnyTagged, Context> = {
	[S in Exclude<State['type'], Final>]:
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
	[S in Exclude<State['type'], 'error'>]: {
		normalize?: Modify<(State & { type: S })['value']>
		select?: Init<object, [(State & { type: S })['value']]>
	}
}

type NonTransitory<O extends Opts<any, any, any>> = {
	type: ValueUnion<{
		[S in keyof O]: O[S] extends { always: any } ? never : S
	}>
}

type InferResult<
	State extends AnyTagged,
	O extends Opts<any, any, any>,
> = 'select' extends keyof ValueUnion<O>
	? ValueUnion<O>['select'] extends Init<infer R, any[]>
		? // FIXME: prettify not working here
			State & { value: R }
		: never
	: State

export function baseMachine<
	State extends AnyTagged,
	Event extends AnyTagged,
	Context = Empty,
>() {
	return function <
		O extends Opts<Event, State, Context>,
		Param = void,
		const Extract extends AnyFinalState = Tagged<'success', 'void'>,
	>(
		init: Sender<State, [Param]>,
		opts: O,
		extract?: (
			state: Prettify<Exclude<State & NonTransitory<O>, AnyErrorState>>,
		) => Send<Extract>,
	): Machine<
		Param,
		Event,
		Prettify<Exclude<State & NonTransitory<O>, AnyErrorState>>,
		Prettify<State & NonTransitory<O> & AnyErrorState>,
		Context,
		Prettify2<InferResult<State & NonTransitory<O>, O>>,
		Extract
	> {
		function always(next: State): State & NonTransitory<O> {
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
				return always(fromSender(init, param)) as any
			},
			send(event, state, context) {
				const e = (opts as any)[state.type as any]?.send[event.type]
				if (!e) return state
				return always(fromSender(e, event.value, state.value, context)) as any
			},
			getResult(state) {
				const s = (opts as any)[state.type].select
				if (s) {
					const value = state.value as any
					return {
						type: state.type,
						value: { ...value, ...fromInit(s, state.value) },
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
