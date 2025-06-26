import type { AnyTagged, SingletonKeys, Tagged } from '../../types'
import { fromInit, type Init } from '@prncss-xyz/utils'

export type AnySuccessState = Tagged<'success', unknown>
export type AnyFinalState = Tagged<'final', unknown>
export type AnyErrorState = Tagged<'error', unknown>
export type AnyExtractState = Tagged<'success' | 'error', unknown>

export type Machine<
	Param,
	Event extends AnyTagged,
	State extends AnyTagged,
	Context,
	Result,
	Extract extends AnyExtractState,
> = {
	init: (param: Param) => State
	send: (event: Event, state: State, context: Context) => State
	getResult: (state: State) => Result
	extract: (state: State) => Extract
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
