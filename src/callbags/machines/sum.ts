import { fromInit, type Init } from '@prncss-xyz/utils'

import type { ValueUnion } from '../../types'

import { just, nothing, type Nothing } from '../../errors'
import {
	type AnyTagged,
	type BottomTag,
	tag,
	type Tagged,
	type Tags,
} from '../../tags'
import {
	type AnyFinalState,
	type AnyMachine,
	type InferEvent,
	type InferExit,
	type Machine,
} from './core'

// MAYBE: shortcut for single value state

type AnySum = Record<PropertyKey, AnyMachine>
type InferParams<T extends AnySum> = Tags<{
	[K in keyof T]: T[K] extends Machine<infer P, any, any, any, any, any>
		? P
		: never
}>
// TODO: final
type InferState<T extends AnySum, E> = Tags<{
	[K in keyof T]: T[K] extends Machine<any, infer S, any, any, any, any>
		? Exclude<S, AnyFinalState>
		: never
}>
type AnyOnExit<Sum extends AnySum> = {
	[K in keyof Sum]: (
		e: InferExit<Sum[K]>,
	) => InferParams<Sum> | Tagged<'final', unknown>
}
type InferFinal<T extends AnyOnExit<AnySum>> = ValueUnion<{
	[K in keyof T]: AnyFinalState & ReturnType<T[K]>
}>

export function sumMachine<Context extends AnyTagged = BottomTag>() {
	return function <
		Param,
		Sum extends Record<PropertyKey, Machine<any, any, any, Context, any, any>>,
		OnExit extends AnyOnExit<Sum>,
		PassThrough extends boolean = false,
		Events extends Record<
			PropertyKey,
			Partial<{ [K in keyof Sum]: Init<InferEvent<Sum[K]>, [unknown]> }>
		> = Record<never, unknown>,
	>(
		sum: Sum,
		props: {
			init: Init<InferParams<Sum>, [Param]>
			onExit: OnExit
		},
		opts?: Partial<{
			events?: Events
			exit?: any
			getResult?: any
			passThrough?: PassThrough
		}>,
	) {
		return {
			exit(
				s: AnyTagged,
			): Nothing | (ReturnType<ValueUnion<OnExit>> & Tagged<'final', unknown>) {
				if (s.type === 'final') {
					const res = opts?.exit ? opts.exit(s.value) : s.value
					return just.of(res) as any
				}
				return nothing.void()
			},
			getResult(s: AnyTagged) {
				const type = s.type
				const machine = sum[type]
				const res = machine.getResult(s.value)
				if (opts?.getResult) return opts.getResult(res)
				return res
			},
			init(param: Param) {
				return fromInit(props.init, param)
			},
			send(e: AnyTagged, state: AnyTagged, c: Context) {
				const machine = sum[state.type]
				let next: any
				let ev = opts?.events?.[e.type]?.[state.type]
				if (ev) {
					next = fromInit(ev, e.value)
				} else if (opts?.passThrough) next = machine.send(e, state.value, c)
				else return state
				const exit = machine.exit(next)
				if (just.is(exit)) {
					return props.onExit[state.type](just.get(exit) as any)
				}
				return tag(state.type, next)
			},
		}
	}
}
