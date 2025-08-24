import { lens } from './lens'

// equivalence relation
export function includes<X>(x: X) {
	return lens<boolean, X[]>({
		get: (xs) => xs.includes(x),
		set: (v, xs) => {
			if (xs.includes(x) === v) return xs
			if (v) return [...xs, x]
			return xs.filter((x_) => x_ !== x)
		},
		// mapper could improve speed
		// sorted list could improve speed
	})
}
