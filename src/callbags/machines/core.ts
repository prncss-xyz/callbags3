import { fromInit, type Init } from '@prncss-xyz/utils'

import type { AnyTagged, SingletonKeys, Tagged } from '../../types'

export type AnySuccessState = Tagged<'success', unknown>
export type AnyFinalState = Tagged<'final', unknown>
export type AnyErrorState = Tagged<'error', unknown>
export type AnyExtractState = Tagged<'error' | 'success', unknown>

export type AnyMachine = Machine<any, any, any, any, any, any>

export type Emit<M extends AnyTagged> = (m: M) => void

export type Machine<
	Param,
	Event extends AnyTagged,
	State extends AnyTagged,
	Message extends AnyTagged,
	Result,
	Extract extends AnyExtractState,
> = {
	extract: (state: State) => Extract
	getResult: (state: State) => Result
	init: (param: Param) => State
	send: (event: Event, state: State, emit: Emit<Message>) => State
}

export type Send<Res extends AnyTagged> = Res | SingletonKeys<Res>

export function fromSend<Res extends AnyTagged>(v: Send<Res>): Res {
	if (typeof v === 'object') return v
	return { type: v, value: undefined } as Res
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
