import type { Prettify } from '../../types'
import type { Just, Maybe, Nothing } from './core'
import type { UnwrapMaybe } from './unwrap'

describe('UnwrapMaybe', () => {
	it('should unwrap', () => {
		expectTypeOf<
			UnwrapMaybe<{ a: Maybe<string>; b: Nothing }>
		>().toEqualTypeOf<Nothing>()
		expectTypeOf<
			UnwrapMaybe<{ a: Maybe<string>; b: Maybe<number> }>
		>().toEqualTypeOf<Prettify<Maybe<{ a: string; b: number }>>>()
		expectTypeOf<
			UnwrapMaybe<{ a: Just<string>; b: Just<number> }>
		>().toEqualTypeOf<Prettify<Just<{ a: string; b: number }>>>()
	})
})
