import type { AnyMulti, AnyPull, Source } from '../sources/core'

export function ap<A, Bs extends any[], P extends AnyPull, M extends AnyMulti>(
	...cbs: { [K in keyof Bs]: (value: A) => Bs[K] }
) {
	return function <Err>(
		source: Source<A, Err, P, M>,
	): Source<Bs[number], Err, P, M> {
		return function (props) {
			return source({
				...props,
				next(value) {
					cbs.forEach((cb) => props.next(cb(value)))
				},
			})
		}
	}
}
