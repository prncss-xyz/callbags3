type Handler = ReturnType<typeof setInterval>

import type { Source } from '../../core/types'

export function interval(period: number): Source<number, never> {
	return function (next) {
		let index = 0
		let handler: Handler
		return {
			start() {
				handler = setInterval(() => {
					next(index++)
				}, period)
			},
			unmount() {
				clearInterval(handler)
			},
		}
	}
}
