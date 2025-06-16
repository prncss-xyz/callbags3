// https://medium.com/flock-community/monads-simplified-with-generators-in-typescript-part-1-33486bf9d887
import { fromInit, type Init } from '@prncss-xyz/utils'

function* chain<TFrom, TTo>(
	mapper: (t: TFrom) => Iterable<TTo>,
	source: Iterable<TFrom>,
): Iterable<TTo> {
	for (const item of source) {
		for (const nestedItem of mapper(item)) {
			yield nestedItem
		}
	}
}

export function multi<N, R>(
	genFn: () => Generator<Init<Iterable<N>>, R, N>,
): Iterable<R> {
	return Array.from(run([]))
	function run(history: Array<N>): Iterable<R> {
		const g = genFn()
		let yielded = g.next()
		for (const next of history) yielded = g.next(next)
		if (yielded.done) return [yielded.value]

		return chain((next) => run(history.concat(next)), fromInit(yielded.value))
	}
}

export function* pick<A>(as: Init<Iterable<A>>) {
	return (yield as) as A
}

export function* where<A>(cond: boolean) {
	if (!cond) return yield* pick<A>([])
}

export function* effect<T>(eff: () => T) {
	return yield* pick(() => [eff()])
}
