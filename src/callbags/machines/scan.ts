import type { AnyTagged } from '../../types'
import type { AnyPull, MultiSource } from '../sources'
import { deferCond } from '../../utils'
import type {
	Machine,
	AnyExtractState,
} from './core'

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
		return function ({ next, error, context, complete }) {
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
				next: (event) => handlerState(machine.send(event, lastState, context)),
				error,
				context,
				complete: () => next(lastState),
			})
			deferCond(res, () => handlerState(machine.init(param)))
			return res
		}
	}
}
