import type { AnyPull, Pull, SingleSource } from '../sources/core'

export function result<Succ, P extends AnyPull>(): (
	sink: SingleSource<Succ, never, P>,
) => P extends Pull ? Succ : Promise<Succ>
export function result<Succ, P extends AnyPull>(): (
	sink: SingleSource<Succ, never, P>,
) => P extends Pull ? Succ : Promise<Succ>
export function result<Succ, P extends AnyPull>() {
	return function (
		sink: SingleSource<Succ, never, P>,
	): P extends Pull ? Succ : Promise<Succ> {
		let res: Succ
		let cp = function (v: Succ) {
			props.unmount()
			res = v
		}
		const props = sink({
			complete: undefined,
			error(e) {
				throw new Error(`unexpected error ${e}`)
			},
			next(s) {
				props.unmount()
				cp(s)
			},
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
