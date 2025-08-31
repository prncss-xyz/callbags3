import { eq } from '../../core/eq'
import { collect } from '../../extractors/collect'
import { once } from './once'

const collector = collect(eq<number>())

describe('once', () => {
	test('', () => {
		const res = collector(once(0))
		expect(res).toEqual([0])
	})
})
