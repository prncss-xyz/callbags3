import type { AnyTagged } from '../../tags'
import type { AnyPull, MultiSource } from '../sources'
import type { Emit, Machine } from './core'

import { just, type Maybe } from '../../errors'
import { deferCond } from '../../utils'

// TODO: Mealy vs Moore

export function scanMachine<
	Param,
	Event extends AnyTagged,
	State extends AnyTagged,
	Context extends AnyTagged,
	Result,
	Exit extends Maybe<unknown>,
>(
	machine: Machine<Param, Event, State, Context, Result, Exit>,
	param: Param,
	context: Emit<Context>,
) {
	return function <SourceErr, P extends AnyPull>(
		source: MultiSource<Event, SourceErr, P>,
	): MultiSource<State, SourceErr, P> {
		return function ({ complete, error, next }) {
			let lastState: State
			function handlerState(state: State) {
				lastState = state
				next(state)
				if (just.is(machine.exit(state))) complete()
			}
			const res = source({
				complete: () => next(lastState),
				error,
				next: (event) => handlerState(machine.send(event, lastState, context)),
			})
			deferCond(res, () => handlerState(machine.init(param)))
			return res
		}
	}
}
