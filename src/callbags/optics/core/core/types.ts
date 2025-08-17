// TODO: D -> (typeof REMOVE & W) | never


export declare const TAGS: unique symbol

export type Emitter<T, S, E> = (
	next: (t: T) => void,
	error: (e: E) => void,
	complete: () => void,
) => (s: S) => { start: () => void; unmount: () => void }

export type Getter<T, S, E> = (
	s: S,
	next: (t: T) => void,
	error: (e: E) => void,
) => void

type OpticCore<T, S> = {
	modifier: (
		m: (t: T, next: (t: T) => void) => void,
		next: (s: S) => void,
		s: S,
	) => void
	remover: (s: S, next: (s: S) => void) => void
}

export type Traversable<T, S, E> = OpticCore<T, S> & {
	emitter: Emitter<T, S, E>
}

export type Prism<T, S, E> = OpticCore<T, S> & {
	getter: (s: S, next: (t: T) => void, error: (e: E) => void) => void
	reviewer: (t: T, next: (s: S) => void, s: S | void) => void
}

export type Types = 'optional' | 'prism' | 'traversable'

export type Optional<T, S, E> = OpticCore<T, S> & {
	getter: (s: S, next: (t: T) => void, error: (e: E) => void) => void
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
export type Optic<T, S, E, F = {}> = _OpticArg<T, S, E> & { [TAGS]: F }
