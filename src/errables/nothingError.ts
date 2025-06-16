import { singleton } from '../tags'

export const CNothingError = singleton('nothing')
export const nothingError = CNothingError.void()
export type NothingError = typeof nothingError
