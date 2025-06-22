import type { AnyMulti, AnyPull, Source } from '../../sources/core'

export function filter<
	Value,
	Context,
	P extends AnyPull,
	M extends AnyMulti,
	T extends Value,
>(
	cond: (value: Value, context: Context) => value is T,
): <Err>(
	source: Source<Value, Context, Err, P, M>,
) => Source<T, Context, Err, P, M>
export function filter<Value, Index, P extends AnyPull, M extends AnyMulti>(
	cond: (value: Value, context: Index) => unknown,
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
				next(value) {
					if (cond(value, props.context)) props.next(value)
				},
			})
		}
	}
}
