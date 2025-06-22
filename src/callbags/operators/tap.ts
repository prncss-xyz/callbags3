import { type AnyMulti, type AnyPull, type Source } from '../sources'

export function tap<Value, Context, Err, P extends AnyPull, M extends AnyMulti>(
	onSuccess: (value: Value, context: Context) => void,
) {
	return function (
		source: Source<Value, Context, Err, P, M>,
	): Source<Value, Context, Err, P, M> {
		return function (props) {
			return source({
				...props,
				next(value) {
					onSuccess(value, props.context)
					props.next(value)
				},
			})
		}
	}
}
