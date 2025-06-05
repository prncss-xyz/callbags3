import type { Observable } from './core'

export function interval(
	period: number,
): Observable<number, number, never, undefined> {
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
