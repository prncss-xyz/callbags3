import type { AnyTagged } from '../../types'
import type { AnyPull, MultiSource, SingleSource } from '../sources'
import { deferCond } from '../../utils'
import type {
	AnyErrorState,
	AnyFinalState,
	Machine,
	AnySuccessState,
} from './core'

export function foldMachine<
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
	): SingleSource<
		(Extract & AnySuccessState)['value'],
		Context,
		SourceErr | (ErrState | (Extract & AnyErrorState))['value'],
		P
	> {
		return function ({ next, error, context }) {
			let safeState: SafeState
			function handleComplete(state: SafeState) {
				const res = machine.extract(state)
				if (res.type === 'error') {
					error(res.value)
					return
				}
				next(res.value as any)
				return
			}
			function handleState(state: SafeState | ErrState) {
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
				next: (event) => handleState(machine.send(event, safeState, context)),
				error,
				context,
				complete: () => handleComplete(safeState),
			})
			deferCond(res, () => handleState(machine.init(param)))
			return res
		}
	}
}
