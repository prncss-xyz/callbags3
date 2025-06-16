import type { AnyMulti, AnyPull, Source } from '../sources/core'

export function ap<
	A,
	Bs extends any[],
	Index,
	P extends AnyPull,
	M extends AnyMulti,
>(...cbs: { [K in keyof Bs]: (value: A, index: Index) => Bs[K] }) {
	return function <Err>(
		source: Source<A, Index, Err, P, M>,
	): Source<Bs[number], Index, Err, P, M> {
		return function (props) {
			return source({
				...props,
				next(value, index) {
					cbs.forEach((cb) => props.next(cb(value, index), index))
				},
			})
		}
	}
}
