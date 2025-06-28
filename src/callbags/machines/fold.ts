import type { AnyTagged } from '../../types'
import type { AnyPull, MultiSource, SingleSource } from '../sources'
import type {
	AnyErrorState,
	AnyExtractState,
	AnySuccessState,
	Machine,
} from './core'

import { deferCond } from '../../utils'

export function foldMachine<
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
	): SingleSource<
		(AnySuccessState & Extract)['value'],
		Context,
		(AnyErrorState & Extract)['value'] | SourceErr,
		P
	> {
		return function ({ context, error, next }) {
			let safeState: State
			function handleComplete(state: State) {
				const res = machine.extract(state)
				if (res.type === 'error') {
					error(res.value)
					return
				}
				next(res.value as any)
				return
			}
			function handleState(state: State) {
				switch (state.type) {
					case 'error':
						error(state.value)
						break
					case 'success':
						handleComplete(state)
						break
					default:
						safeState = state as any
				}
			}
			const res = source({
				complete: () => handleComplete(safeState),
				context,
				error,
				next: (event) => handleState(machine.send(event, safeState, context)),
			})
			deferCond(res, () => handleState(machine.init(param)))
			return res
		}
	}
}
