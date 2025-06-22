import type { AnyPull, Pull, SingleSource } from '../sources/core'

export function result<Succ, P extends AnyPull, Context>(
	context: Context,
): (
	sink: SingleSource<Succ, Context, never, P>,
) => P extends Pull ? Succ : Promise<Succ>
export function result<Succ, P extends AnyPull>(): (
	sink: SingleSource<Succ, void, never, P>,
) => P extends Pull ? Succ : Promise<Succ>
export function result<Succ, P extends AnyPull, Context = void>(
	context: Context = undefined as any,
) {
	return function (
		sink: SingleSource<Succ, Context, never, P>,
	): P extends Pull ? Succ : Promise<Succ> {
		let res: Succ
		let cp = function (v: Succ) {
			props.unmount()
			res = v
		}
		const props = sink({
			context,
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
