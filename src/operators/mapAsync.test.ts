import { flow, id } from '@constellar/core'
import { timed } from '@prncss-xyz/utils'
import { describe, expect, test } from 'vitest'

import { map } from './map'
import { mapAsync } from './mapAsync'
import { iterable } from '../sources/pull'
import { toPush } from './toPush'
import { fold } from './folds/fold'
import { toArray } from './folds/folds/base'
import { result } from '../observe'

describe('mapAsync', () => {
	test('', async () => {
		const res = await flow(
			toPush(iterable([9, 2, 0])),
			map(async (v) => {
				await timed(v * 10)
				return v
			}),
			mapAsync(id),
			fold(toArray()),
			result(),
		)
		expect(res).toEqual([0, 2, 9])
	})
})
