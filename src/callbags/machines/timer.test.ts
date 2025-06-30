import type { Tagged, Tags } from '../../types'

import { modalMachine } from './modal'

type State = Tags<
	{
		idle: { elapsed: number }
		running: { since: number }
	},
	{ now: number }
>

type Event = Tags<{
	resetTimer: void
	tick: number
	toggle: void
}>

type SD<Result, State, S, E = never> = {
	deserialize: (s: S, last: State) => State
	serialize: (s: Result) => S
	validate?: (s: unknown) => Tagged<'error', E> | Tagged<'success', S>
}

const sd: SD<{ count: number }, State, number> = {
	deserialize: (count, { value: { now } }) => ({
		type: 'idle',
		value: { elapsed: count, now },
	}),
	serialize: ({ count }) => count,
}

export const timer = modalMachine<Event, State>()(
	(now: number) => ({ type: 'idle', value: { elapsed: 0, now } }),
	{
		idle: {
			select: ({ elapsed }) => ({
				count: elapsed,
			}),
			send: {
				resetTimer: (_, props) => ({
					type: 'idle',
					value: { ...props, elapsed: 0 },
				}),
				tick: (now, props) => ({
					type: 'idle',
					value: { ...props, now },
				}),
				toggle: (_, { elapsed, now }) => ({
					type: 'running',
					value: { now, since: now - elapsed },
				}),
			},
		},
		running: {
			select: ({ now, since }) => ({
				count: now - since,
			}),
			send: {
				resetTimer: (_, { now }) => ({
					type: 'running',
					value: { now, since: now },
				}),
				tick: (now, props) => ({
					type: 'running',
					value: { ...props, now },
				}),
				toggle: (_, { now, since }) => ({
					type: 'idle',
					value: { elapsed: now - since, now },
				}),
			},
		},
	},
)

type T = ReturnType<typeof timer.getResult>

describe('baseMachine', () => {
	it.todo('send')
})
