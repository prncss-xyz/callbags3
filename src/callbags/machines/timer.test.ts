import type { Tags } from '../../types'
import { baseMachine } from './base'

type State = Tags<
	{
		running: { since: number }
		idle: { ellapsed: number }
	},
	{ now: number }
>

type Event = Tags<{
	tick: { now: number }
	start: void
	stop: void
	reset: void
}>

export const { init, send, getResult } = baseMachine<State, Event>()(
	(now: number) => ({ type: 'idle', value: { ellapsed: 0, now } }),
	{
		idle: {
			send: {
				reset: (_, { now }) => ({ type: 'idle', value: { ellapsed: 0, now } }),
				start: (_, { ellapsed, now }) => ({
					type: 'running',
					value: { since: now - ellapsed, now },
				}),
				tick: ({ now }, s) => ({ type: 'idle', value: { ...s, now } }),
			},
			select: ({ ellapsed }) => ({ count: ellapsed }),
		},
		running: {
			send: {
				reset: (_, { now }) => ({
					type: 'running',
					value: { since: now, now },
				}),
				stop: (_, { now }, { since }) => ({
					type: 'idle',
					value: { ellapsed: now - since, now },
				}),
				tick: ({ now }, s) => ({ type: 'running', value: { ...s, now } }),
			},
			select: ({ since, now }) => ({ count: now - since }),
		},
	},
)

type T = ReturnType<typeof getResult>

describe('baseMachine', () => {
	it.todo('send')
})
