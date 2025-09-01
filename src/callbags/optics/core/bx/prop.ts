/* eslint-disable @typescript-eslint/no-empty-object-type */
import { _compo } from '../core/compose'

type OptionalKeys<T> = {
	[K in keyof T]: object extends Pick<T, K> ? K : never
}[keyof T]

type OptionalValue<T> = (null | undefined) & T extends never ? never : 'empty'

export function prop<Key extends keyof O, O>(key: Key) {
	return _compo<
		Exclude<O[Key], null | undefined>,
		O,
		OptionalValue<O[Key]>,
		never,
		{ optional: true },
		Key extends OptionalKeys<O> ? { removable: true } : {}
	>({
		getter: (o, succ, err) => {
			const res = o[key]
			if (res === undefined || res === null) return err('empty' as any)
			return succ(res as Exclude<O[Key], null | undefined>)
		},
		remover: (o, succ) => {
			const res = { ...o }
			delete res[key]
			return succ(res)
		},
		setter: (v, succ, o) => succ({ ...o, [key]: v }),
	})
}
