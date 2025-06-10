import type { AnyMulti, Source } from '../sources/core'

function pendingCounter(onDone: () => void) {
	let completed = false
	let count = 0
	function after() {
		if (count === 0 && completed) {
			onDone()
		}
	}
	return {
		complete() {
			completed = true
			after()
		},
		async wrap(p: Promise<unknown>) {
			count++
			try {
				await p
			} finally {
				count--
				after()
			}
		},
	}
}

export function mapAsync<A, Index, B, M extends AnyMulti>(
	cb: (value: A, index: Index) => Promise<B>,
) {
	return function <Err>(
		source: Source<A, Index, Err, undefined, M>,
	): Source<B, Index, Err, undefined, M> {
		return function (props) {
			if (props.complete) {
				const { complete, wrap } = pendingCounter(props.complete)
				return source({
					complete: complete as any,
					error: props.error,
					next(value, index) {
						wrap(cb(value, index).then((v) => props.next(v, index)))
					},
				})
			}
			return source({
				error: props.error,
				next(value: A, index: Index) {
					cb(value, index).then((v) => props.next(v, index))
				},
			} as any)
		}
	}
}
