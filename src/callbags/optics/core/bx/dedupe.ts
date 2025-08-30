import { rewrite } from './rewrite'

export function dedupe<Whole>(areEqual = Object.is) {
	return rewrite<Whole>((next, last) => (areEqual(next, last) ? last : next))
}
