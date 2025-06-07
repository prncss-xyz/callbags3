import { DomainError } from '../errors'

export interface Observer<Value, Index, Err extends DomainError> {
	complete: () => void
	error: (fail: Err) => void
	next: (value: Value, index: Index) => void
}

export type Pull = () => void
export type AnyPull = Pull | undefined
export type Multi = () => void
export type AnyMulti = Multi | undefined

export type Source<
	Value,
	Index,
	Err extends DomainError,
	Pull extends AnyPull,
	Multi extends AnyMulti,
> = (observer: {
	complete: Multi
	error: (fail: Err) => void
	next: (value: Value, index: Index) => void
}) => {
	pull: Pull
	unmount: () => void
}

export type MultiSource<
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
	next: (value: Value) => void
	complete: void
}

export type SingleSource<
	Succ,
	Err extends DomainError,
	Pull extends AnyPull,
> = (extractor: Extractor<Succ, Err>) => {
	pull: Pull
	unmount: () => void
}
