import { noop } from '@constellar/core'
import type { DomainError } from '../errors'
import type { Pull, Source } from '../sources/core'
import { observe } from '../observe/observe'

export function toPush<Value, Index, Err extends DomainError>(
	source: Source<Value, Index, Err, Pull>,
): Source<Value, Index, Err, undefined> {
	return function ({ complete, error, next }) {
		observe({
			error,
			next,
		})(source)
		complete()
		return {
			pull: undefined,
			result: noop,
			unmount: noop,
		}
	}
}
