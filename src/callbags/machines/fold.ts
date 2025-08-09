import type { InferGuard } from '../../guards'
import type { BottomRecord } from '../../types'
import type { AnyPull, MultiSource, SingleSource } from '../sources'
import type { Machine } from './core'

import {
	just,
	type Just,
	type Maybe,
	type Nothing,
} from '../../errors/maybe/core'
import { type AnyTagged, singleton } from '../../tags'
import { deferCond } from '../../utils'

const unfinished = singleton('unfinished')
type UnFinished = InferGuard<typeof unfinished.is>

export function foldMachine<
	Param,
	Event extends AnyTagged,
	State extends AnyTagged,
	Context extends BottomRecord,
	Result,
	Exit extends Maybe<any> = Nothing,
>(
	machine: Machine<Param, Event, State, Context, Result, any>,
	param: Param,
	context: Context,
) {
	return function <SourceErr, P extends AnyPull>(
		source: MultiSource<Event, SourceErr, P>,
	): SingleSource<
		Exit extends Just<infer J> ? J : never,
		SourceErr | UnFinished,
		P
	> {
		return function ({ error, next }) {
			let lastState: State
			function handleState(state: State) {
				const res = machine.exit(state)
				if (just.is(res)) next(just.get(res) as never)
				else lastState = state
			}
			const res = source({
				complete: () => error(unfinished.void()),
				error,
				next: (event) => handleState(machine.send(event, lastState, context)),
			})
			deferCond(res, () => handleState(machine.init(param)))
			return res
		}
	}
}
