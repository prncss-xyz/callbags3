import { describe } from 'node:test'

import type { Guard } from './primitives'

import { isOneOf } from './composition'

describe('isOneOf', () => {
	test('', () => {
		expectTypeOf(isOneOf(1, 2, 3)).toEqualTypeOf<Guard<1 | 2 | 3>>()
	})
})
