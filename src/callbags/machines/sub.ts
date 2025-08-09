import { fromInit } from '@prncss-xyz/utils'

import type { BottomRecord, Init } from '../../types'
import type { Machine } from './core'

import { just, type Maybe, type Nothing } from '../../errors'
import {
	type AnyTagged,
	isTagged,
	tag,
	type Tagged,
	type ValueFor,
} from '../../tags'

export type SubMachine<M> =
	M extends Machine<infer Param, any, any, any, any, any> ? Param : never

export type SubMachineEntry<
	Superstate extends Tagged<PropertyKey, unknown>,
	Name extends Superstate['type'],
	Event extends AnyTagged,
	Context extends BottomRecord,
	SubState,
	Result extends object,
> = {
	always(param: ValueFor<Superstate, Name>): any
	select: Init<Result, [ValueFor<Superstate, Name>]>
	send(event: Event, state: any, context: Context): Tagged<Name, SubState>
}

export function subMachine<
	Superstate extends Tagged<PropertyKey, unknown>,
	Name extends Superstate['type'],
	Event extends AnyTagged,
	Context extends AnyTagged,
	SubState,
	SubResult extends object,
	Result extends object,
	Exit extends Maybe<unknown> = Nothing,
>(
	name: Name,
	machine: Machine<
		ValueFor<Superstate, Name>,
		Event,
		SubState,
		Context,
		SubResult,
		Exit
	>,
	onExit: (exit: ValueFor<Exit, 'just'>) => Superstate,
	select?: Init<Result, [SubResult]>,
) {
	return {
		always(state: ValueFor<Superstate, Name>): any {
			const s: Tagged<Name, SubState> | ValueFor<Superstate, Name> =
				state as any
			if (isTagged(s)) return s
			return tag(name, machine.init(s))
		},
		select(state: ValueFor<Superstate, Name>) {
			const s: Tagged<Name, SubState> = state as any
			const result = machine.getResult(s.value)
			return select ? fromInit(select, result) : (result as any)
		},
		send(event: Event, state: any, context: Context) {
			const s: Tagged<Name, SubState> = state as any
			const last = s.value
			const next = machine.send(event, last, context)
			if (next === last) return s
			const exit = machine.exit(next)
			if (just.is(exit)) return onExit(just.get(exit))
			return tag(name, next)
		},
	}
}
