export type Pull = () => void
export type AnyPull = Pull | undefined
export type Multi = () => void
export type AnyMulti = Multi | undefined

export interface Observer<Value, Index, Err, M extends AnyMulti> {
	complete: M
	error: (fail: Err) => void
	next: (value: Value, index: Index) => void
}

export type Source<
	Value,
	Index,
	Err,
	P extends AnyPull,
	M extends AnyMulti,
> = (observer: {
	complete: M
	error: (fail: Err) => void
	next: (value: Value, index: Index) => void
}) => {
	pull: P
	unmount: () => void
}

export type MultiSource<Value, Index, Err, Pull extends AnyPull> = Source<
	Value,
	Index,
	Err,
	Pull,
	Multi
>

export type SingleSource<Value, Index, Err, Pull extends AnyPull> = Source<
	Value,
	Index,
	Err,
	Pull,
	undefined
>
