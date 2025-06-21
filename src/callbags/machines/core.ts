import type { AnyTagged, SingletonKeys, Tagged } from '../../types'
import { fromInit, type Init } from '@prncss-xyz/utils'

export type Final = 'error' | 'success'

export type Machine<
	Param,
	Event extends AnyTagged,
	State extends AnyTagged,
	Context,
	Result,
> = {
	init: (param: Param) => State
	send: (
		event: Event,
		state: Exclude<State, Tagged<Final, unknown>>,
		context: Context,
	) => State
	result: (state: Exclude<State, Tagged<'error', unknown>>) => Result
}

export type Sender<Res extends AnyTagged, Args extends any[]> = Init<
	Res | SingletonKeys<Res>,
	Args
>

export function fromSender<Res extends AnyTagged, Args extends any[]>(
	sender: Sender<Res, Args>,
	...args: Args
): Res {
	const v = fromInit(sender, ...args)
	if (typeof v === 'object') return v
	return { type: v } as Res
}
