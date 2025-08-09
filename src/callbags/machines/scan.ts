import type { AnyTagged } from '../../tags'
import type { BottomRecord } from '../../types'
import type { AnyPull, MultiSource } from '../sources'
import type { Machine } from './core'

import { just, type Maybe } from '../../errors'
import { deferCond } from '../../utils'

// TODO: Mealy vs Moore

export function scanMachine<
	Param,
	Event extends AnyTagged,
	State,
	Context extends BottomRecord,
	Result,
	Exit extends Maybe<unknown>,
>(
	machine: Machine<Param, Event, State, Context, Result, Exit>,
	param: Param,
	context: Context,
) {
	return function <SourceErr, P extends AnyPull>(
		source: MultiSource<Event, SourceErr, P>,
	): MultiSource<Result, SourceErr, P> {
		return function ({ complete, error, next }) {
			let lastState: State
			function handleState(state: State) {
				lastState = state
				next(machine.getResult(state))
				if (just.is(machine.exit(state))) complete()
			}
			const res = source({
				complete,
				error,
				next: (event) => handleState(machine.send(event, lastState, context)),
			})
			deferCond(res, () => handleState(machine.init(param)))
			return res
		}
	}
}
