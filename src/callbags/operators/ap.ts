import type { AnyMulti, AnyPull, Source } from '../sources/core'

export function ap<
	A,
	Bs extends any[],
	Context,
	P extends AnyPull,
	M extends AnyMulti,
>(...cbs: { [K in keyof Bs]: (value: A, index: Context) => Bs[K] }) {
	return function <Err>(
		source: Source<A, Context, Err, P, M>,
	): Source<Bs[number], Context, Err, P, M> {
		return function (props) {
			return source({
				...props,
				next(value) {
					cbs.forEach((cb) => props.next(cb(value, props.context)))
				},
			})
		}
	}
}
