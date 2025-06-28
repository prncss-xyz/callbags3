import type { AnyTagged } from '../../types'
import type { AnyPull, MultiSource } from '../sources'
import type { AnyExtractState, Machine } from './core'

import { deferCond } from '../../utils'

export function scanMachine<
	Param,
	Event extends AnyTagged,
	State extends AnyTagged,
	Context,
	Result,
	Extract extends AnyExtractState,
>(
	machine: Machine<Param, Event, State, Context, Result, Extract>,
	param: Param,
) {
	return function <SourceErr, P extends AnyPull>(
		source: MultiSource<Event, Context, SourceErr, P>,
	): MultiSource<State, Context, SourceErr, P> {
		return function ({ complete, context, error, next }) {
			let lastState: State
			function handlerState(state: State) {
				if (state.type === 'final') {
					next(state)
					complete()
					return
				}
				next(state)
				lastState = state
			}
			const res = source({
				complete: () => next(lastState),
				context,
				error,
				next: (event) => handlerState(machine.send(event, lastState, context)),
			})
			deferCond(res, () => handlerState(machine.init(param)))
			return res
		}
	}
}
