import { pipe } from '@constellar/core'

import { playlist } from './playlist.test'
import { productMachine } from './product'
import { timer } from './timer.test'

const app = productMachine()(
	{
		playlist,
		timer,
	},
	(now: number) => ({
		playlist: undefined,
		timer: now,
	}),
	(chain) => ({
		tick: ({ now }: { now: number }) =>
			pipe(
				chain([
					{
						event: 'tick',
						machine: 'timer',
						value: now,
					},
				]),
				chain(
					({
						playlist: {
							value: { currentDuration },
						},
						timer: {
							value: { count },
						},
					}) => {
						if (count >= currentDuration) {
							// TODO: ring
							return [
								{
									event: 'resetTimer',
									machine: 'timer',
								},
								{
									event: 'next',
									machine: 'playlist',
								},
							]
						}
						return []
					},
				),
			),
	}),
	{ passthrough: true },
)
