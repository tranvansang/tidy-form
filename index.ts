import type {Get} from 'type-fest'
import type {SetStateAction} from 'react'
import {nextStateFromAction} from 'misc-hooks'
import type {IBroadcastStream} from 'jdefer'
import {makeBroadcastStream} from 'jdefer'
import {deepPick, get, set} from 'jmisc'

export interface FormControl<T> {
	// Field can be nested by having dot in between

	get(): T // return all
	get<V extends string>(field: V): Get<T, V> // return single field
	get<V extends string>(fields: V[]): {[P in V]: Get<T, P>} // return object of multiple fields

	setAll(action: SetStateAction<T>): void // set all fields
	set<V extends string>(field: V, action: SetStateAction<Get<T, V>>): void // set field

	subscribe(cb: (newVal: T) => any): () => void // subscribe to all fields. return unsubscribe function
	subscribe<V extends keyof T & string>(field: V, cb: (newVal: Get<T, V>) => any): () => void // subscribe to single field. return unsubscribe function
}

export default function makeFormControl<T>(defaultValue?: T): FormControl<T> {
	let value: T = defaultValue
	const stream = makeBroadcastStream<T>() // listen for each direct child field
	const streams: Partial<Record<keyof T, IBroadcastStream<T[keyof T]>>> = {} // listen for any field
	return {
		get(fields) {
			return fields === undefined
				? value
				: Array.isArray(fields)
					? deepPick(value, fields)
					: get(value, fields)
		},
		set(field, action) {
			value = set(value, field, nextStateFromAction(action, get(value, field)))
			const firstField: keyof T = field.split('.', 2)[0] as keyof T
			streams[firstField]?.next(get(value, firstField)) // always fire even if value does not change
			stream.next(value)
		},
		setAll(v) {
			value = nextStateFromAction(v, value)
			for (const [field, s] of Object.entries(streams)) s?.next(get(value, field))
			stream.next(value)
		},
		subscribe(field, cb) {
			return typeof field === 'function'
				? stream.listen(field)
				: (streams[field] ??= makeBroadcastStream()).listen(cb)
		},
	}
}
