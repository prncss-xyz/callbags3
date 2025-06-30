import { directMachine } from './direct'

const m = directMachine()(
	{ value: 0 },
	{
		a: (_: void, { value }) => ({ value: value + 1 }),
		b: (e: number, { value }) => ({ value: value + e }),
		c: { value: 8 },
	},
	{
		getStatus: ({ value }) => (value % 2 === 0 ? 'pending' : 'final'),
		normalize: ({ value }) => ({ value: value + 1 }),
		select: ({ value }) => ({ double: value * 2 }),
	},
	() => ({ type: 'success', value: 'victoire' }),
)

export const { getResult, init, send } = m
