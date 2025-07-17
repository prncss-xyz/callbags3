import { noop } from '@constellar/core'

import type { AnyMulti, MultiSource, Pull, Source } from '../sources/core'

import { observe } from '../observe/observe'

export function toPush<Value, Err, Multi extends AnyMulti>(
	source: MultiSource<Value, Err, Pull>,
): Source<Value, Err, undefined, Multi> {
	return function ({ complete, error, next }) {
		observe({
			complete: noop,
			error,
			next,
		})(source)
		complete?.()
		return {
			pull: undefined,
			unmount: noop,
		}
	}
}
