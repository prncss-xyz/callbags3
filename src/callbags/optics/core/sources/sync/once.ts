import { noop } from "@constellar/core"

export function once<S>(s: S) {
	return <E>(
		next: (s: S) => void,
		_error: (e: E) => void,
		complete: () => void,
	) => ({
		start: () => {
			next(s)
			return complete()
		},
		unmount: noop,
	})
}
