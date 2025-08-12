// TODO: W -> W | never
// TODO: D -> (typeof REMOVE & W) | never

export type Focus<T, S, E, P extends never | void> = (
	eq: Optic<S, S, never, void>,
) => Optic<T, S, E, P>

export type Emitter<T, S, E> = (
	next: (t: T) => void,
	error: (e: E) => void,
	complete: () => void,
) => (s: S) => { start: () => void; unmount: () => void }

export interface Optic<T, S, E, P extends never | void> {
	emitter: Emitter<T, S, E>
	getter: (s: S, next: (t: T) => void, error: (e: E) => void) => void
	modifier: (
		m: (t: T, next: (t: T) => void) => void,
		next: (s: S) => void,
		s: S,
	) => void
	remover: (t: T, next: (t: T) => void) => void
	setter: (t: T, next: (s: S) => void, s: P | S) => void
}

interface OpticCore<T, S> {
	modifier: (
		m: (t: T, next: (t: T) => void) => void,
		next: (s: S) => void,
		s: S,
	) => void
	remover: (t: T, next: (t: T) => void) => void
}

export interface OpticSingle<T, S, E, P extends never | void>
	extends OpticCore<T, S> {
	getter: (s: S, next: (t: T) => void, error: (e: E) => void) => void
	setter: (t: T, next: (s: S) => void, s: P | S) => void
}

export interface OpticMulti<T, S, E> extends OpticCore<T, S> {
	emitter: Emitter<T, S, E>
}

export type OpticAll<T, S, E, P extends never | void> =
	| OpticMulti<T, S, E>
	| OpticSingle<T, S, E, P>
