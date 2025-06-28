import { playlist } from './playlist.test'
import { productMachine } from './product'
import { timer } from './timer.test'
import { pipe } from '@constellar/core'

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
						machine: 'timer',
						event: 'tick',
						value: now,
					},
				]),
				chain(
					({
						timer: {
							value: { count },
						},
						playlist: {
							value: { currentDuration },
						},
					}) => {
						if (count >= currentDuration) {
							// TODO: ring
							return [
								{
									machine: 'timer',
									event: 'resetTimer',
								},
								{
									machine: 'playlist',
									event: 'next',
								},
							]
						}
						return []
					},
				),
			),
	}),
	{ passtrough: true },
)
