import { simpleMachine } from './simple'

const m = simpleMachine()(
	{ value: 0 },
	{
		a: (_: void, { value }) => ({ value: value + 1 }),
		b: (e: number, { value }) => ({ value: value + e }),
		c: { value: 8 },
	},
	{
		normalize: ({ value }) => ({ value: value + 1 }),
		getStatus: ({ value }) =>
			value % 2 === 0
				? { type: 'success', value: undefined }
				: { type: 'error', value: 'vava' },
		select: ({ value }) => ({ double: value * 2 }),
	},
	(s) => ({ type: 'success', value: 'victoire' }),
)

export const { init, send, getResult } = m
