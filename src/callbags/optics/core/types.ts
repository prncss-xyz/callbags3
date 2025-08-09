// TODO: W -> W | never
// TODO: D -> (typeof REMOVE & W) | never

export type Focus<T, S, E, P extends never | void> = (
	eq: Optic<S, S, never, void>,
) => Optic<T, S, E, P>

export interface Optic<T, S, E, P extends never | void> {
	emitter: (s: S, next: (t: T) => void, complete: () => void) => void
	getter: (s: S, next: (t: T) => void, error: (e: E) => void) => void
	modifier: (
		m: (t: T, next: (t: T) => void) => void,
		next: (s: S) => void,
		s: S,
	) => void
	remover: (t: T, next: (t: T) => void) => void
	setter: (t: T, next: (s: S) => void, s: P | S) => void
}
