import { err, succ } from '../../../../../errors'
import { eq } from '../../core/eq'
import { collect } from '../../extractors/collect'
import { unfold } from './unfold'

const collector = collect(eq<number>())

describe('unfold', () => {
	test('', () => {
		const res = collector(
			unfold(0, (acc) => (acc < 3 ? succ.of(acc + 1) : err.of('empty'))),
		)
		expect(res).toEqual([1, 2, 3])
	})
})
