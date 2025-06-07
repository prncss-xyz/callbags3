import { type AnyMulti, type AnyPull, type Source } from '../sources'

export function tap<Value, Index, Err, P extends AnyPull, M extends AnyMulti>(
	onSuccess: (value: Value, index: Index) => void,
) {
	return function (
		source: Source<Value, Index, Err, P, M>,
	): Source<Value, Index, Err, P, M> {
		return function (props) {
			return source({
				...props,
				next(value, index) {
					onSuccess(value, index)
					props.next(value, index)
				},
			})
		}
	}
}
