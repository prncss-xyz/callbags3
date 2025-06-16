import type { AnyMulti, AnyPull, Source } from '../sources/core'

export interface Obs<Value, Index, Err, M extends AnyMulti> {
	complete: M
	error: (fail: Err) => void
	next: (value: Value, index: Index) => void
}

function deferCond(sync: unknown, cb: () => void) {
	if (sync) cb()
	else setTimeout(cb, 0)
}

export function observe<Value, Index, Err, M extends AnyMulti>(
	props: Obs<Value, Index, Err, M>,
) {
	return function (source: Source<Value, Index, Err, AnyPull, M>) {
		const { pull, unmount } = source({
			complete: props.complete
				? () => {
						deferCond(pull, () => {
							unmount()
							props.complete!()
						})
					}
				: (undefined as any),
			error(err) {
				deferCond(pull, () => {
					unmount()
					props.error(err)
				})
			},
			next: props.next,
		})
		pull?.()
	}
}
