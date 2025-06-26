import type { AnyTagged, SingletonKeys, Tagged } from '../../types'
import { fromInit, type Init } from '@prncss-xyz/utils'

export type Final = 'error' | 'success'
export type AnyErrorState = Tagged<'error', unknown>
export type AnySuccessState = Tagged<'success', unknown>
export type AnyFinalState = Tagged<Final, unknown>

export type Machine<
	Param,
	Event extends AnyTagged,
	SafeState extends AnyTagged,
	ErrState extends AnyErrorState,
	Context,
	Result,
	Extract extends AnyFinalState,
> = {
	init: (param: Param) => SafeState | ErrState
	send: (event: Event, state: SafeState, context: Context) => SafeState | ErrState
	getResult: (state: SafeState) => Result
	extract: (state: SafeState | ErrState) => Extract | AnyErrorState
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
