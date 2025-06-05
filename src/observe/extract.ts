import { noop } from '@constellar/core'
import type { DomainError } from '../errors'
import type { AnyPull, Pull, Sink } from '../sources/core'

type PR<P extends AnyPull, V> = P extends Pull ? V : Promise<V>
type T<P, Q> = P extends unknown ? Q : never

export function extract<
	Value,
	Index,
	Err extends DomainError,
	Succ,
	S,
	E,
	P extends AnyPull,
>({
	onSuccess,
	onError,
}: {
	onSuccess: (s: Succ) => S
	onError: (e: Err) => E
}) {
	return function (
		sink: Sink<Value, Index, Err, P, Succ>,
	): PR<P, T<Succ, S> | T<Err, E>> {
		let res: S | E
		let cp = function (v: S | E) {
			props.unmount()
			res = v
		}
		const props = sink({
			complete() {
				props.unmount()
				cp(onSuccess(props.result()))
			},
			error(e) {
				props.unmount()
				cp(onError(e))
			},
			next: noop,
		})
		if (props.pull) {
			props.pull()
			return res! as any
		}
		return new Promise((resolve) => {
			cp = function (v) {
				resolve(v)
			}
		}) as any
	}
}
