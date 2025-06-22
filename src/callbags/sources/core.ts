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
	Context,
	Err,
	P extends AnyPull,
	M extends AnyMulti,
> = (observer: {
	complete: M
	context: Context
	error: (fail: Err) => void
	next: (value: Value) => void
}) => {
	pull: P
	unmount: () => void
}

export type MultiSource<Value, Context, Err, Pull extends AnyPull> = Source<
	Value,
	Context,
	Err,
	Pull,
	Multi
>

export type SingleSource<Value, Context, Err, Pull extends AnyPull> = Source<
	Value,
	Context,
	Err,
	Pull,
	undefined
>
