import { always } from '@prncss-xyz/utils'

export class DomainError {}

export class EmptyError extends DomainError {}

export const emptyErrorValue = new EmptyError()

export const emptyError = always(emptyErrorValue)
