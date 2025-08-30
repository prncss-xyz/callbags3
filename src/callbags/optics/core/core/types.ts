// TODO: D -> (typeof REMOVE & W) | never

export declare const TAGS: unique symbol
export declare const LTAGS: unique symbol

export type Source<T, E> = (
	next: (t: T) => void,
	error: (e: E) => void,
	complete: () => void,
) => {
  start: () => void;
  unmount: () => void;
}

export type Emitter<T, S, E1> = <E2>(
	source: Source<S, E2>,
) => Source<T, E1 | E2>

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

export type Traversable<T, S, E> = OpticCore<S> & {
	emitter: Emitter<T, S, E>
	modifier: Modifier<T, S>
}

export type Prism<T, S, E> = OpticCore<S> & {
	getter: (s: S, next: (t: T) => void, error: (e: E) => void) => void
	modifier?: Modifier<T, S>
	reviewer: (t: T, next: (s: S) => void, s: S | void) => void
}

export type Optional<T, S, E> = OpticCore<S> & {
	getter: (s: S, next: (t: T) => void, error: (e: E) => void) => void
	modifier?: Modifier<T, S>
	setter: (t: T, next: (s: S) => void, s: S) => void
}

export type _SetterArg<T, S, E> =
	| Optional<T, S, E>
	| Prism<T, S, E>
	| Traversable<T, S, E>

export type _OpticArg<T, S, E> =
	| _SetterArg<T, S, E>
	| {
			emitter: Emitter<T, S, E>
	  }
	| {
			getter: (s: S, next: (t: T) => void, error: (e: E) => void) => void
	  }

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type Optic<T, S, E, F = {}, LF = {}> = _OpticArg<T, S, E> & {
	[LTAGS]: LF
} & { [TAGS]: F }
