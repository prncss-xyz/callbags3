import { flow } from '@constellar/core'
import { isNumber, isString } from '@prncss-xyz/utils'

import { type InferGuard, isUnknown } from '../guards/primitives'
import { union } from './unions'

export const [isLr, { center, left, right }] = union({
	center: isUnknown,
	left: isNumber,
	right: isString,
})
type LR = InferGuard<typeof isLr>

export function tmp(x: LR) {
	return flow(
		x,
		left.map((v) => v + 1),
		left.chain((x) => right.of(x + '!')),
		right.map((v) => v + '!'),
	)
}
