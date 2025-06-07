import type { MultiSource } from '../sources/core'

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

export function mapAsync<A, Index, B>(
	cb: (value: A, index: Index) => Promise<B>,
) {
	return function <Err>(
		source: MultiSource<A, Index, Err, undefined>,
	): MultiSource<B, Index, Err, undefined> {
		return function (props) {
			const { complete, wrap } = pendingCounter(props.complete)
			return source({
				complete,
				error: props.error,
				next(value, index) {
					wrap(cb(value, index).then((v) => props.next(v, index)))
				},
			})
		}
	}
}
