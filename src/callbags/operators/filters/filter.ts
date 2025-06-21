import type { AnyMulti, AnyPull, Source } from '../../sources/core'

export function filter<
	Value,
	Index,
	P extends AnyPull,
	M extends AnyMulti,
	T extends Value,
>(
	cond: (value: Value, index: Index) => value is T,
): <Err>(source: Source<Value, Index, Err, P, M>) => Source<T, Index, Err, P, M>
export function filter<Value, Index, P extends AnyPull, M extends AnyMulti>(
	cond: (value: Value, index: Index) => unknown,
): <Err>(
	source: Source<Value, Index, Err, P, M>,
) => Source<Value, Index, Err, P, M>
export function filter<Value, Index, P extends AnyPull, M extends AnyMulti>(
	cond: (value: Value, index: Index) => unknown,
) {
	return function <Err>(
		source: Source<Value, Index, Err, P, M>,
	): Source<Value, Index, Err, P, M> {
		return function (props) {
			return source({
				...props,
				next(value, index) {
					if (cond(value, index)) props.next(value, index)
				},
			})
		}
	}
}
