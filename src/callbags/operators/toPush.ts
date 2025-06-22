import { noop } from '@constellar/core'
import type { AnyMulti, MultiSource, Pull, Source } from '../sources/core'
import { observe } from '../observe/observe'

export function toPush<Value, Context, Err, Multi extends AnyMulti>(
	source: MultiSource<Value, Context, Err, Pull>,
): Source<Value, Context, Err, undefined, Multi> {
	return function ({ complete, error, next, context }) {
		observe(
			{
				complete: noop,
				error,
				next,
			},
			context,
		)(source)
		complete?.()
		return {
			pull: undefined,
			unmount: noop,
		}
	}
}
