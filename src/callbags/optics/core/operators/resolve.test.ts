import { pipe } from '@constellar/core'

import { succ } from '../../../../errors/either'
import { focus } from '../core/focus'
import { preview, update } from '../extractors'
import { prop } from './prop'
import { resolve } from './resolve'

describe('resolve', () => {
	type S = {
		current: string
		items: Partial<Record<string, { name: string }>>
	}
	const o = focus<S>()(
		pipe(
			prop('current'),
			resolve((k) => pipe(prop('items'), prop(k))),
			prop('name'),
		),
	)
	it('view', () => {
		expect(
			preview(o)({
				current: 'a',
				items: {
					a: { name: 'toto' },
					b: { name: 'titi' },
				},
			}),
		).toEqual(succ.of('toto'))
	})
	it('update', () => {
		expect(
			update(o)((u) => u.toUpperCase())({
				current: 'a',
				items: {
					a: { name: 'toto' },
					b: { name: 'titi' },
				},
			}),
		).toEqual({
			current: 'a',
			items: {
				a: { name: 'TOTO' },
				b: { name: 'titi' },
			},
		})
	})
})
