import type { InferGuard } from '../../guards'
import type { AnyPull, MultiSource, SingleSource } from '../sources'
import type { Emit, Machine } from './core'

import { just, type Just, type Maybe } from '../../errors/maybe/core'
import { type AnyTagged, singleton } from '../../tags'
import { deferCond } from '../../utils'

const unfinished = singleton('unfinished')
type UnFinished = InferGuard<typeof unfinished.is>

export function foldMachine<
	Param,
	Event extends AnyTagged,
	State extends AnyTagged,
	Context extends AnyTagged,
	Result,
	Exit extends Maybe<unknown>,
>(machine: Machine<Param, Event, State, Context, Result, Exit>, param: Param) {
	return function <SourceErr, P extends AnyPull>(
		source: MultiSource<Event, Emit<Context>, SourceErr, P>,
	): SingleSource<
		Exit extends Just<infer J> ? J : never,
		Emit<Context>,
		SourceErr | UnFinished,
		P
	> {
		return function ({ context, error, next }) {
			let lastState: State
			function handleState(state: State) {
				const res = machine.exit(state)
				if (just.is(res)) next(just.get(res) as never)
				else lastState = state
			}
			const res = source({
				complete: () => error(unfinished.void()),
				context,
				error,
				next: (event) => handleState(machine.send(event, lastState, context)),
			})
			deferCond(res, () => handleState(machine.init(param)))
			return res
		}
	}
}
