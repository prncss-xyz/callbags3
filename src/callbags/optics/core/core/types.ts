// TODO: D -> (typeof REMOVE & W) | never

export declare const TAGS: unique symbol
export declare const LTAGS: unique symbol

export type Source<T, E> = (
	next: (t: T) => void,
	error: (e: E) => void,
	complete: () => void,
) => {
	start: () => void
	unmount: () => void
}

export type Emitter<T, S, E> = <E2>(source: Source<S, E2>) => Source<T, E | E2>

export type Getter<T, S, E> = (
	s: S,
	next: (t: T) => void,
	error: (e: E) => void,
) => void

export type Modifier<T, S> = (
	m: (t: T, next: (t: T) => void) => void,
	next: (s: S) => void,
	s: S,
) => void

type OpticCore<S> = {
	remover: (s: S, next: (s: S) => void) => void
}

export type Traversable<T, S, EG, EF> = OpticCore<S> & {
	emitter: Emitter<T, S, EF>
	modifier: Modifier<T, S>
	toEmpty: () => EG
}

export type Prism<T, S, EG, EF> = OpticCore<S> & {
	getter: Getter<T, S, EF | EG>
	modifier?: Modifier<T, S>
	reviewer: (t: T, next: (s: S) => void, s: S | void) => void
}

export type Optional<T, S, EG, EF> = OpticCore<S> & {
	getter: Getter<T, S, EF | EG>
	modifier?: Modifier<T, S>
	setter: (t: T, next: (s: S) => void, s: S) => void
}

export type _SetterArg<T, S, EG, EF> =
	| Optional<T, S, EF, EG>
	| Prism<T, S, EF, EG>
	| Traversable<T, S, EG, EF>

export type _OpticArg<T, S, EG, EF> =
	| _SetterArg<T, S, EG, EF>
	| {
			emitter: Emitter<T, S, EF>
			toEmpty: () => EG
	  }
	| {
			getter: Getter<T, S, EF | EG>
	  }

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type Optic<T, S, EG, EF, F = {}, LF = {}> = _OpticArg<T, S, EG, EF> & {
	[LTAGS]: LF
} & { [TAGS]: F }
