import { iso } from './iso'

export function linear(m: number, b = 0) {
	return iso<number, number>({
		get: (x) => m * x + b,
		set: (y) => (y - b) / m,
	})
}
