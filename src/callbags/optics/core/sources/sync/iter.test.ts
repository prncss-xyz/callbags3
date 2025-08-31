import { eq } from '../../core/eq'
import { collect } from '../../extractors/collect'
import { iter } from './iter'

const collector = collect(eq<number>())

describe('iter', () => {
	test('', () => {
		const res = collector(iter([0, 1, 2]))
		expect(res).toEqual([0, 1, 2])
	})
})
