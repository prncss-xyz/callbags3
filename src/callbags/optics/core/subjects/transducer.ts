import { fromInit, type Init } from '@prncss-xyz/utils'

import type { Optic, Source } from '../core/types'

import { getEmitter } from '../core/compose'
import { eq, type Eq } from '../core/eq'

export function transduce<Value, S, ES, EG, EF, F>(
	s: Source<S, ES>,
	o: Init<Optic<Value, S, EG, EF, F>, [Eq<S, ES>]>,
): Source<Value, EF | ES> {
	return getEmitter(fromInit(o, eq<S, ES>()))(s)
}
