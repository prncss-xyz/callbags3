import { noop } from '@constellar/core'
import type { AnyMulti, MultiSource, Pull, Source } from '../sources/core'
import { observe } from '../observe/observe'

export function toPush<
	Value,
	Index,
	Err,
	Multi extends AnyMulti,
>(
	source: MultiSource<Value, Index, Err, Pull>,
): Source<Value, Index, Err, undefined, Multi> {
	return function ({ complete, error, next }) {
		observe({
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
