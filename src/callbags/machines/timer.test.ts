import type { Tagged, Tags } from '../../types'
import { baseMachine } from './base'

type State = Tags<
	{
		running: { since: number }
		idle: { ellapsed: number }
	},
	{ now: number }
>

type Event = Tags<{
	tick: number
	toggle: void
	resetTimer: void
}>

type SD<Result, State, S, E = never> = {
	validate?: (s: unknown) => Tagged<'success', S> | Tagged<'error', E>
	serialize: (s: Result) => S
	deserialize: (s: S, last: State) => State
}

const sd: SD<{ count: number }, State, number> = {
	serialize: ({ count }) => count,
	deserialize: (count, { value: { now } }) => ({
		type: 'idle',
		value: { now, ellapsed: count },
	}),
}

export const timer = baseMachine<Event, State>()(
	(now: number) => ({ type: 'idle', value: { ellapsed: 0, now } }),
	{
		idle: {
			send: {
				tick: (now, props) => ({
					type: 'idle',
					value: { ...props, now },
				}),
				resetTimer: (_, props) => ({
					type: 'idle',
					value: { ...props, ellapsed: 0 },
				}),
				toggle: (_, { now, ellapsed }) => ({
					type: 'running',
					value: { since: now - ellapsed, now },
				}),
			},
			select: ({ ellapsed }) => ({
				count: ellapsed,
			}),
		},
		running: {
			send: {
				tick: (now, props) => ({
					type: 'running',
					value: { ...props, now },
				}),
				resetTimer: (_, { now }) => ({
					type: 'running',
					value: { since: now, now },
				}),
				toggle: (_, { now, since }) => ({
					type: 'idle',
					value: { ellapsed: now - since, now },
				}),
			},
			select: ({ since, now }) => ({
				count: now - since,
			}),
		},
	},
)

type T = ReturnType<typeof timer.getResult>

describe('baseMachine', () => {
	it.todo('send')
})
