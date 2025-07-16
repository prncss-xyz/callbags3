import { fromInit, type Init } from '@prncss-xyz/utils'

import type { Err, Maybe, Nothing, Succ } from '../../errors'

import { type AnyTagged, fromSend, type Send, type Tagged } from '../../tags'

export type AnyFinalState = Tagged<'final', unknown>

export type AnyMachine = Machine<any, any, any, any, any, any>

export type Emit<M extends AnyTagged> = (m: M) => void

export interface ISR<State, Serialized, E> {
	deserialize: (serialized: Serialized, state: State) => State
	serialize: (state: State) => Serialized
	validate?: (serialized: unknown) => Err<E> | Succ<State>
}

export type Machine<
	Param,
	Event extends AnyTagged,
	State,
	Message extends AnyTagged,
	Result,
	Exit extends Maybe<unknown> = Nothing,
> = {
	exit: (state: State) => Exit
	getResult: (state: State) => Result
	init: (param: Param) => State
	send: (event: Event, state: State, emit: Emit<Message>) => State
}

export type Sender<Res extends AnyTagged, Args extends any[]> = Init<
	Send<Res>,
	Args
>

export function fromSender<Res extends AnyTagged, Args extends any[]>(
	sender: Sender<Res, Args>,
	...args: Args
): Res {
	return fromSend(fromInit(sender, ...args))
}
