import {useEffect, useState} from 'react'
import type {Get} from 'type-fest'
import {useEffectWithPrevDeps} from 'misc-hooks'
import type {FormControl} from './index.ts'
import makeForm from './index.mjs'

export function useForm<T>(defaultValue?: T | (() => T)): FormControl<T> {
	return useState(() => makeForm<T>(typeof defaultValue === 'function' ? defaultValue() : defaultValue))[0]
}

export function useFormValue<T>(form: FormControl<T>): T
export function useFormValue<T, V extends string>(form: FormControl<T>, field: V): Get<T, V>
export function useFormValue<T, V extends string>(form: FormControl<T>, field?: V): Get<T, V> {
	const firstField = field?.split('.', 2)[0] as keyof T
	const [state, setState] = useState(() => form.get(field))
	// update state if field changes
	useEffectWithPrevDeps(([prevForm, prevName]) => {
		if (prevForm !== form || prevName !== field) setState(form.get(field))
	}, [form, field])
	useEffect(() => field === undefined
			? form.subscribe(() => setState(form.get()))
			: form.subscribe(firstField, () => setState(form.get(field))),
		[form, field, firstField]
	)
	return state
}
