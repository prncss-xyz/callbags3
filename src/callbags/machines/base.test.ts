import type { Tags } from '../../types'
import { baseMachine } from './base'

type State = Tags<{
	running: { since: number }
	idle: { ellapsed: number }
}>

type Event = Tags<{
	start: { now: number }
	stop: { now: number }
	reset: { now: number }
}>

export const { init, send, result } = baseMachine<State, Event>()(
	{ type: 'idle', value: { ellapsed: 0 } },
	{
		idle: {
			send: {
				start: ({ now }, { ellapsed }) => ({
					type: 'running',
					value: { since: now - ellapsed },
				}),
			},
			select: ({ ellapsed }) => ({ count: () => ellapsed }),
		},
		running: {
			send: {
				stop: ({ now }, { since }) => ({
					type: 'idle',
					value: { ellapsed: now - since },
				}),
			},
			select: ({ since }) => ({ count: (now: number) => now - since }),
		},
	},
)
