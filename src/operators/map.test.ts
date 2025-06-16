import { flow } from '@constellar/core'
import { mul } from '@prncss-xyz/utils'
import { iterable } from '../sources/pull'
import { map } from './map'
import { fold } from './folds/fold'
import { last } from './folds/folds/base'
import { just, safeMaybe } from '../errables/maybe'
import { result } from '../observe'

describe('map', () => {
	test('changes type', () => {
		const res = flow(
			iterable([1, 2, 3, 4]),
			map(mul(2)),
			map(String),
			map((x, i) => x + i),
			fold(last()),
			safeMaybe(),
			result(),
		)
		expect(res).toEqual(just.of('83'))
	})
})
