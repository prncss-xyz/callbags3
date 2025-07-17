import type { AnyMulti, AnyPull, Source } from '../../sources/core'

export function filter<
	Value,
	P extends AnyPull,
	M extends AnyMulti,
	T extends Value,
>(
	cond: (value: Value) => value is T,
): <Err>(source: Source<Value, Err, P, M>) => Source<T, Err, P, M>
export function filter<Value, P extends AnyPull, M extends AnyMulti>(
	cond: (value: Value) => unknown,
): <Err>(source: Source<Value, Err, P, M>) => Source<Value, Err, P, M>
export function filter<Value, P extends AnyPull, M extends AnyMulti>(
	cond: (value: Value) => unknown,
) {
	return function <Err>(
		source: Source<Value, Err, P, M>,
	): Source<Value, Err, P, M> {
		return function (props) {
			return source({
				...props,
				next(value) {
					if (cond(value)) props.next(value)
				},
			})
		}
	}
}
