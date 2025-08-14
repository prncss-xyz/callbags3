// TODO: W -> W | never
// TODO: D -> (typeof REMOVE & W) | never
// R -> RW -> prism, removable
// tags: getter, (optional), (traversable), async

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

export type Optic<T, S, E, P extends void, _F = object> = {
	modifier: (
		m: (t: T, next: (t: T) => void) => void,
		next: (s: S) => void,
		s: S,
	) => void
	remover: (t: T, next: (t: T) => void) => void
} & (
	| {
			emitter: Emitter<T, S, E>
	  }
	| {
			getter: (s: S, next: (t: T) => void, error: (e: E) => void) => void
			setter: (t: T, next: (s: S) => void, s: P | S) => void
	  }
)
