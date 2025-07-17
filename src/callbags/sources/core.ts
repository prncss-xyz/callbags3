export type Pull = () => void
export type AnyPull = Pull | undefined
export type Multi = () => void
export type AnyMulti = Multi | undefined

export interface Observer<Value, Err, M extends AnyMulti> {
	complete: M
	error: (fail: Err) => void
	next: (value: Value) => void
}

export type Source<
	Value,
	Err,
	P extends AnyPull,
	M extends AnyMulti,
> = (observer: {
	complete: M
	error: (fail: Err) => void
	next: (value: Value) => void
}) => {
	pull: P
	unmount: () => void
}

export type MultiSource<Value, Err, Pull extends AnyPull> = Source<
	Value,
	Err,
	Pull,
	Multi
>

export type SingleSource<Value, Err, Pull extends AnyPull> = Source<
	Value,
	Err,
	Pull,
	undefined
>
