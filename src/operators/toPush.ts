import { noop } from '@constellar/core'
import type { DomainError } from '../errors'
import type { MultiSource, Pull } from '../sources/core'
import { observe } from '../observe/observe'

export function toPush<Value, Index, Err extends DomainError>(
	source: MultiSource<Value, Index, Err, Pull>,
): MultiSource<Value, Index, Err, undefined> {
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
