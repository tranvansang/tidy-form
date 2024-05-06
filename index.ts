import type {Get} from 'type-fest'
import type {SetStateAction} from 'react'
import {nextStateFromAction} from 'misc-hooks'
import type {IBroadcastStream} from 'jdefer'
import {makeBroadcastStream} from 'jdefer'
import {get, set} from 'jmisc'

type FormGet<T, K extends string> = K extends '' ? T : Get<T, K>

export interface FormControl<T> {
	// Field can be nested by having dot in between

	get(): T // return all. Same as get('')
	get<K extends string>(field: K): FormGet<T, K> // return single field. empty string to get root value, same as get()

	set<K extends string>(field: K, action: SetStateAction<FormGet<T, K>>): FormGet<T, K> // set field. Use empty string to set root value

	subscribe(cb: (newVal: T) => any): () => void // subscribe to all fields. return unsubscribe function
	subscribe<K extends keyof T & string>(field: K, cb: (newVal: FormGet<T, K>) => any): () => void // subscribe to single field. return unsubscribe function
}

export default function makeFormControl<T>(defaultValue?: T): FormControl<T> {
	let value: T = defaultValue
	const streams: Partial<Record<keyof T, IBroadcastStream<T[keyof T]>>> = {}
	const counts: Partial<Record<keyof T, number>> = {}
	return {
		get(field) {
			return get(value, field === '' ? undefined : field)
		},
		set(field, action) {
			// always fire even if value does not change

			if (field === '') field = undefined
			const newVal = nextStateFromAction(action, get(value, field))
			value = set(value, field, newVal)

			field ??= ''

			// notify all children
			for (const key of Object.keys(streams).slice().sort().reverse()) {
				if (key.startsWith(field)) {
					streams[key].next(get(value, key))
				}
			}

			// notify all parents, including root
			const parts = field.split('.')
			for (let i = parts.length - 1; i >= 0; i--) {
				const parentField = parts.slice(0, i).join('.')
				streams[parentField]?.next(get(value, parentField || undefined))
			}

			return newVal
		},
		subscribe(field, cb) {
			if (cb === undefined) {
				cb = field
				field = '' as keyof T
			}

			counts[field] = (counts[field] ?? 0) + 1
			const unsubscribe = (streams[field] ??= makeBroadcastStream()).listen(cb)
			return () => {
				const cnt = counts[field] = (counts[field] ?? 0) - 1
				if (cnt <= 0) {
					delete streams[field]
					delete counts[field]
				}
				unsubscribe()
			}
		},
	}
}
