import { fromInit, type Init } from '@prncss-xyz/utils'
import type { Empty, Prettify, Tagged, Values } from '../../types'

// TODO: auto merge
// TODO: allow simple values
type Transitions<Events, State, Context> = {
	[E in keyof Events]: (e: Events[E], s: State, c: Context) => Partial<State>
}
type InferEvent<T> =
	T extends Transitions<infer E, any, any>
		? Prettify<
				Values<{
					[K in keyof E]: { type: K; value: E[K] }
				}>
			>
		: never

function simpleMachine<Context = void>() {
	return function <
		Value,
		T extends Transitions<any, Value, Context>,
		Param = void,
		Success = never,
		Error = never,
		Result = Empty,
	>(
		init: Init<Value, [Param]>,
		{
			transitions,
			status,
			select,
		}: {
			transitions: T
			status?: (
				value: Value,
			) =>
				| Tagged<'pending', Value>
				| Tagged<'success', Success>
				| Tagged<'error', Error>
			select?: {
				[K in 'pending' | Success extends never ? never : 'success']: (
					v: K extends 'pending' ? Value : Success,
				) => Result
			}
		},
	) {
		type Event = InferEvent<T>
		type PState = Prettify<Tagged<'pending', Value>>
		function send(
			event: Event,
			state: PState,
			context: Context,
		): Prettify<Tagged<'pending', Value>> | Result {
			const { type, value } = event
			if (!(type in transitions)) return state as any
			const cb = transitions[type]
			let next: any = fromInit(cb, value, state.value, context)
			if (status) next = status(next)
			return next
		}
		function result(next: PState) {
			const sel: any = (select as any)?.[next.type as any]
			if (sel) next = { type: next.type, value: sel(next.value) }
			return next
		}
		return {
			init(p: Param) {
				let next: any = fromInit(init, p)
				if (status) next = status(next)
				return next
			},
			send,
			result,
		}
	}
}

const m = simpleMachine()(0, {
	transitions: {
		a: (_: void, s) => s + 1,
		b: (e: number, s) => s + e,
	},
	status: (v) =>
		v % 2 ? { type: 'success', value: v } : { type: 'error', value: `v` },
	transform: { a: (v) => v },
})

type t = ReturnType<typeof m.send>
const r = m.result()
const p = r.selectSuccess
const q = r.selectPending
