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

export function mapAsync<A, B, M extends AnyMulti>(
	cb: (value: A) => Promise<B>,
) {
	return function <Err>(
		source: Source<A, Err, undefined, M>,
	): Source<B, Err, undefined, M> {
		return function (props) {
			if (props.complete) {
				const { complete, wrap } = pendingCounter(props.complete)
				return source({
					complete: complete as any,
					error: props.error,
					next(value) {
						wrap(cb(value).then((v) => props.next(v)))
					},
				})
			}
			return source({
				error: props.error,
				next(value: A) {
					cb(value).then((v) => props.next(v))
				},
			} as any)
		}
	}
}
