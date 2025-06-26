import type { AnyTagged } from '../../types'
import type { AnyPull, MultiSource } from '../sources'
import { deferCond } from '../../utils'
import type { Machine, AnyErrorState, AnyFinalState } from './core'

export function scanMachine<
	Param,
	Event extends AnyTagged,
	SafeState extends AnyTagged,
	ErrState extends AnyErrorState,
	Context,
	Result,
	Extract extends AnyFinalState,
>(
	machine: Machine<Param, Event, SafeState, ErrState, Context, Result, Extract>,
	param: Param,
) {
	return function <SourceErr, P extends AnyPull>(
		source: MultiSource<Event, Context, SourceErr, P>,
	): MultiSource<SafeState, Context, ErrState['value'] | SourceErr, P> {
		return function ({ next, error, context, complete }) {
			let safeState: SafeState
			function handlerState(state: SafeState | ErrState) {
				switch (state.type) {
					case 'error':
						error(state.value)
						break
					case 'success':
						next(state)
						complete()
						break
					default:
						next(state as SafeState)
						safeState = state as SafeState
				}
			}
			const res = source({
				next: (event) => handlerState(machine.send(event, safeState, context)),
				error,
				context,
				complete: () => next(safeState),
			})
			deferCond(res, () => handlerState(machine.init(param)))
			return res
		}
	}
}
