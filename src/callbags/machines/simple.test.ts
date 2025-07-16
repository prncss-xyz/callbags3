import { directMachine } from './direct'

const m = directMachine()(
	{ value: 0 },
	{
		a: (_: void, { value }) => ({ value: value + 1 }),
		b: (e: number, { value }) => ({ value: value + e }),
		c: { value: 8 },
	},
	{
		normalize: ({ value }) => ({ value: value + 1 }),
		result: ({ value }) => ({ double: value * 2 }),
	},
)

export const { getResult, init, send } = m
