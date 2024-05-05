# tidy-form - simplest ever form control library

## Exported modules

```javascript
import makeFormControl from 'tidy-form'
import { useFormControl, useFormValue } from 'tidy-form/react'
```

## Usage

- `makeFormControl(defaultValue)` takes a default value and returns a form control object.
Form control object has the following interface with features described by comments.

```typescript
export interface FormControl {
	// Field can be nested by having dot in between, for example: 'my.nested.field.1'

	get() // return all
	get(field: string) // return single field
	get(fields: string[]) // return object of multiple fields

	setAll(action): void // set all fields. action can be object or function that takes current value and returns new value
	set(field: string, action): void // set field. action can be object or function that takes current value and returns new value

	subscribe(cb: (newVal) => any): () => void // subscribe to all fields. return unsubscribe function
	subscribe(field: string, cb: (newVal) => any): () => void // subscribe to single field. return unsubscribe function
}
```

- Exported function from `tidy-form/react` module are `useFormControl` and `useFormValue`.

- `export function useFormControl<T>(defaultValue?: T | (() => T))`: creates a fixed form control object across different renders of the component.
`defaultValue` (optional): can be a value or a function that returns a value.

- `export function useFormValue<T>(form: FormControl<T>): T`: returns the whole form control object.
- `export function useFormValue<T>(form: FormControl<T>, field: string): Get<T, V>`: returns a single field value. Nested field can be accessed by having dot in between, for example: 'my.nested.field.1'.