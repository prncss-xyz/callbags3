import type { AnyPull, Pull, SingleSource } from '../sources/core'

export function result<Succ, Index, P extends AnyPull>() {
	return function (
		sink: SingleSource<Succ, Index, never, P>,
	): P extends Pull ? Succ : Promise<Succ> {
		let res: Succ
		let cp = function (v: Succ) {
			props.unmount()
			res = v
		}
		const props = sink({
			next(s) {
				props.unmount()
				cp(s)
			},
			error(e) {
				throw new Error(`unexpected error ${e}`)
			},
			complete: undefined,
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
