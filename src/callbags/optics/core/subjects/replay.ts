import { isoAssert } from '@prncss-xyz/utils'

import type { Source } from '../core/types'

import { type AnyTagged, tag, type Tags } from '../../../../tags'
import { forbidden } from '../../../../utils'

// cold observable
export function replay<S, ES>(source: Source<S, ES>) {
	let id = 0
	const subs = new Map<
		number,
		{
			complete: () => void
			error: (e: ES) => void
			next: (s: S) => void
		}
	>()
	return function (): Source<S, ES> {
		let state: Tags<{ complete: void; error: ES; next: S[] }> = tag('next', [])
		const { start } = source(
			(s) => {
				isoAssert(state.type === 'next')
				state.value.push(s)
				subs.forEach(({ next }) => next(s))
			},
			(e) => {
				state = tag('error', e)
				subs.forEach(({ error }) => error(e))
			},
			() => {
				state = tag('complete')
				subs.forEach(({ complete }) => complete())
			},
		)
		start()
		return function (next, error, complete) {
			const _id = id++
			return {
				start: () => {
					match(state, {
						complete,
						error,
						next: (s) => {
							s.forEach((s) => next(s))
							subs.set(_id, {
								complete,
								error,
								next,
							})
						},
					})
				},
				unmount: () => {
					subs.delete(_id)
				},
			}
		}
	}
}

// TODO: init
export function match<T extends AnyTagged, R>(
	t: T,
	patterns: { [K in T['type']]: (t: Extract<T, { type: K }>['value']) => R },
): R
export function match<T extends AnyTagged, R, Key extends T['type']>(
	t: T,
	patterns: Partial<{
		[K in Key]: (
			t: Extract<
				T,
				{
					type: K
				}
			>['value'],
		) => R
	}>,
	otherwise: (t: T) => R,
): R
export function match<T extends AnyTagged, R, Key extends T['type']>(
	t: T,
	patterns: Partial<{
		[K in Key]: (t: Extract<T, { type: K }>['value']) => R
	}>,
	otherwise?: (t: T) => R,
) {
	if (t.type in patterns) return patterns[t.type as Key]!(t.value)
	if (otherwise) return otherwise(t)
	return forbidden()
}
