export function defer(cb: () => void) {
	setTimeout(cb, 0)
}

export function deferCond(sync: unknown, cb: () => void) {
	if (sync) cb()
	else setTimeout(cb, 0)
}

export const exhaustive = (v: never) => {
	throw new Error(`Unexpected value: ${v}`)
}

export const forbidden = () => {
  throw new Error('forbidden')
}
