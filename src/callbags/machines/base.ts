import type { AnyTagged, Empty, Modify, Tagged, Values } from '../../types'
import { fromInit, type Init } from '@prncss-xyz/utils'
import { fromSender, type Final, type Machine, type Sender } from './core'
import type { Prettify } from '@constellar/core'

// MAYBE: prevent keys not belonging to State
// MAYBE: simpler inferance for select

type Opts0<Event extends AnyTagged, State extends AnyTagged, Context> = {
	[S in Exclude<State['type'], Final>]:
		| {
				normalize?: Modify<(State & { type: S })['value']>
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
}

type Opts1<
	Event extends AnyTagged,
	State extends AnyTagged,
	Context,
	Select,
> = {
	[S in Exclude<State['type'], Final>]:
		| {
				normalize?: Modify<(State & { type: S })['value']>
				select: Init<Select, [(State & { type: S })['value']]>
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
	[S in State['type'] & 'success']: {
		select: Init<Select, [(State & { type: S })['value']]>
	}
}

type Opts<Event extends AnyTagged, State extends AnyTagged, Context, Select> =
	| Opts1<Event, State, Context, Select>
	| Opts0<Event, State, Context>

type InferTransitory<O extends Opts<any, any, any, object>> = Prettify<
	Values<{
		[S in keyof O]: O[S] extends { always: any } ? Tagged<S, unknown> : never
	}>
>

type InferResult<
	State,
	O extends Opts<any, any, any, object>,
> = 'select' extends keyof Values<O>
	? Values<O>['select'] extends Init<infer R, any[]>
		? { value: R } & State
		: never
	: State

export function baseMachine<
	State extends AnyTagged,
	Event extends AnyTagged,
	Context = Empty,
>() {
	return function <
		O extends Opts<Event, State, Context, object>,
		const Param = void,
	>(
		init: Sender<State, [Param]>,
		opts: O extends Opts<Event, State, Context, Empty> ? O : never,
	): Machine<
		Param,
		Event,
		Exclude<State, InferTransitory<O>>,
		Context,
		Prettify<InferResult<Exclude<State, InferTransitory<O>>, O>>
	> {
		function always(next: State): Exclude<State, InferTransitory<O>> {
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
				const e = (opts as any)[state.type]?.send[event.type]
				if (!e) return state
				return always(fromSender(e, event.value, state.value, context))
			},
			result(state) {
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
		}
	}
}
