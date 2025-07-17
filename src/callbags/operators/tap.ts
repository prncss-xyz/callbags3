import { type AnyMulti, type AnyPull, type Source } from '../sources'

export function tap<Value, Err, P extends AnyPull, M extends AnyMulti>(
	onSuccess: (value: Value) => void,
) {
	return function (source: Source<Value, Err, P, M>): Source<Value, Err, P, M> {
		return function (props) {
			return source({
				...props,
				next(value) {
					onSuccess(value)
					props.next(value)
				},
			})
		}
	}
}
