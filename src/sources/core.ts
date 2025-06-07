export interface Observer<Value, Index, Err> {
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
	Err,
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

export type MultiSource<Value, Index, Err, Pull extends AnyPull> = (
	observer: Observer<Value, Index, Err>,
) => {
	pull: Pull
	unmount: () => void
}

export interface Extractor<Value, Index, Err> {
	error: (fail: Err) => void
	next: (value: Value, index: Index) => void
	complete: undefined
}

export type SingleSource<Succ, Index, Err, Pull extends AnyPull> = (
	extractor: Extractor<Succ, Index, Err>,
) => {
	pull: Pull
	unmount: () => void
}
