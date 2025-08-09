import { fromInit, type Init } from '@prncss-xyz/utils'

import type { Err, Maybe, Succ } from '../../errors'
import type { BottomRecord } from '../../types'

import { type AnyTagged, fromSend, type Send, type Tagged } from '../../tags'

export type AnyFinalState = Tagged<'final', unknown>

export type AnyMachine = Machine<any, any, any, any, any, any>

export interface ISR<State, Serialized, E> {
	deserialize: (serialized: Serialized, state: State) => State
	serialize: (state: State) => Serialized
	validate?: (serialized: unknown) => Err<E> | Succ<State>
}

export type InferParam<M> =
	M extends Machine<infer Param, any, any, any, any, any> ? Param : never
export type InferEvent<M> =
	M extends Machine<any, infer Event, any, any, any, any> ? Event : never
export type InferState<M> =
	M extends Machine<any, any, infer State, any, any, any> ? State : never
export type InferContext<M> =
	M extends Machine<any, any, any, infer Context, any, any> ? Context : never
export type InferResult<M> =
	M extends Machine<any, any, any, any, infer Result, any> ? Result : never
export type InferExit<M> =
	M extends Machine<any, any, any, any, any, infer Exit> ? Exit : never

export type Machine<
	Param,
	Event extends AnyTagged,
	State,
	Context extends BottomRecord,
	Result,
	Exit extends Maybe<unknown>,
> = {
	exit: (state: State) => Exit
	getResult: (state: State) => Result
	init: (param: Param) => State
	send: (event: Event, state: State, context: Context) => State
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
