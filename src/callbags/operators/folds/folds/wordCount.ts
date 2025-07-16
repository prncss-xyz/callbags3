import type { Fold } from '../fold'

function isWordLike(t: string) {
	return /\w/.test(t)
}

export function wordCount<Index>(): Fold<
	string,
	{
		count: number
		last: boolean
	},
	Index,
	number
> {
	return {
		fold: (t, acc) => {
			const last = isWordLike(t)
			const inc = !acc.last && last ? 1 : 0
			return { count: acc.count + inc, last }
		},
		init: () => ({ count: 0, last: false }),
		result: ({ count }) => count,
	}
}
