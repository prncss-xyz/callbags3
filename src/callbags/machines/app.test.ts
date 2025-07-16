import { pipe } from '@constellar/core'

import type { Tagged } from '../../tags'

import { playlist } from './playlist.test'
import { productMachine } from './product'
import { timer } from './timer.test'

export type Message = Tagged<'alert', void>

export const app = productMachine()(
	{
		playlist,
		timer,
	},
	(now: number) => ({
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
						playlist: { currentDuration },
						timer: {
							value: { count },
						},
					}) => {
						if (count >= currentDuration) {
							// TODO: ring
							return [
								{
									event: 'resetPlaylist',
									machine: 'playlist',
								},
								{
									event: 'resetTimer',
									machine: 'timer',
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
