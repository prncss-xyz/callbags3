type Parser<T extends U, U, E> = (
	u: U,
) => (err: (e: E) => void, succ: (t: T) => void) => void

export class Optic<T extends U, U, E> {
	parser: Parser<T, U, E>
	constructor(parser: Parser<T, U, E>) {
		this.parser = parser
	}
}
