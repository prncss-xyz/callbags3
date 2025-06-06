import type { Source } from './core'

export function interval(
	period: number,
): Source<number, number, never, undefined> {
	return function ({ next }) {
		let index = 0
		let handler = setInterval(() => {
			next(index, index)
			index++
		}, period)
		return {
			pull: undefined,
			unmount() {
				clearInterval(handler)
			},
		}
	}
}
