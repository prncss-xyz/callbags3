// TODO: W -> W | never
// TODO: D -> (typeof REMOVE & W) | never

export type Focus<T, S, E, P extends never | void> = (
	eq: Optic<S, S, never, void>,
) => Optic<T, S, E, P>

export interface Optic<T, S, E, P extends never | void> {
	emitter: (s: S, onSuccess: (t: T) => void) => void
	getter: (s: S, onSuccess: (t: T) => void, onError: (e: E) => void) => void
	modifier: (
		m: (t: T, onSuccess: (t: T) => void) => void,
		onSuccess: (s: S) => void,
		s: S,
	) => void
	remover: (t: T, onSuccess: (t: T) => void) => void
	setter: (t: T, onSuccess: (s: S) => void, s: P | S) => void
}
