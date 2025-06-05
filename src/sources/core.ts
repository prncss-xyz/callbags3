import { DomainError } from '../errors'

export interface Observer<Value, Index, Err extends DomainError> {
	complete: () => void
	error: (fail: Err) => void
	next: (value: Value, index: Index) => void
}

export type Pull = () => void
export type AnyPull = Pull | undefined

export type Source<
	Value,
	Index,
	Err extends DomainError,
	Pull extends AnyPull,
> = (observer: Observer<Value, Index, Err>) => {
	pull: Pull
	unmount: () => void
}

export interface Extractor<Value, Err extends DomainError> {
	error: (fail: Err) => void
	success: (value: Value) => void
}

export type Sink<
	Value,
	Index,
	Err extends DomainError,
	Pull extends AnyPull,
	Succ,
> = (observer: Observer<Value, Index, Err>) => {
	pull: Pull
	unmount: () => void
	result: () => Succ
}
