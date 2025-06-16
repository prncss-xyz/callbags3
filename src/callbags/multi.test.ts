import { multi, pick, where } from './multi'

function* range(start: number, end: number, step = 1) {
	for (let i = start; i < end; i += step) {
		yield i
	}
}

describe('do notation', () => {
	test('right triangles', async () => {
		function rightTriangles(maxLengthC: number) {
			return multi(function* () {
				const c = yield* pick(range(1, maxLengthC + 1))
				const a = yield* pick(range(1, c))
				const b = yield* pick(range(1, a))
				yield* where(a ** 2 + b ** 2 === c ** 2)
				return [a, b, c] as const
			})
		}
		const res = rightTriangles(10)
		expect(res).toEqual([
			[4, 3, 5],
			[8, 6, 10],
		])
	})
})
