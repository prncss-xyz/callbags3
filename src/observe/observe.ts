import { isFunction, noop } from '@constellar/core'
import type { DomainError } from '../errors'
import type { AnyPull, MultiSource, Observer } from '../sources/core'

export type ProObserver<Value, Index, Err extends DomainError> =
	| ((value: Value, index: Index) => void)
	| Partial<Observer<Value, Index, Err>>

export function resolveObserver<Value, Index, Err extends DomainError>(
	observer: ProObserver<Value, Index, Err>,
) {
	if (isFunction(observer)) {
		return {
			complete: noop,
			error: noop,
			next: observer,
		}
	}
	return {
		complete: observer.complete ?? noop,
		error: observer.error ?? noop,
		next: observer.next ?? noop,
	}
}

function deferCond(sync: unknown, cb: () => void) {
	if (sync) cb()
	else setTimeout(cb, 0)
}

export function observe<Value, Index, Err extends DomainError>(
	observer: ProObserver<Value, Index, Err>,
) {
	return function (source: MultiSource<Value, Index, Err, AnyPull>) {
		const { complete, error, next } = resolveObserver(observer)
		const { pull, unmount } = source({
			complete() {
				deferCond(pull, () => {
					unmount()
					complete()
				})
			},
			error(err) {
				deferCond(pull, () => {
					unmount()
					error(err)
				})
			},
			next,
		})
		pull?.()
	}
}
