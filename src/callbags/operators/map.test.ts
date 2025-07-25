import { flow } from '@constellar/core'
import { mul } from '@prncss-xyz/utils'

import { just, safeMaybe } from '../../errors/maybe'
import { result } from '../observe'
import { iterable } from '../sources/pull'
import { fold } from './folds/fold'
import { last } from './folds/folds/base'
import { map } from './map'

describe('map', () => {
	test('changes type', () => {
		const res = flow(
			iterable([1, 2, 3, 4]),
			map(mul(2)),
			map(String),
			map((x) => x + 1),
			fold(last()),
			safeMaybe(),
			result(),
		)
		expect(res).toEqual(just.of('81'))
	})
})
