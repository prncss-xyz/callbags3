import { singleton } from '../tags/tags'

const empty = singleton('empty')
export const emptyError = empty
export type EmptyError = typeof emptyError
