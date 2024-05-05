import type { Get } from 'type-fest';
import type { FormControl } from './index.ts';
export declare function useFormControl<T>(defaultValue?: T | (() => T)): FormControl<T>;
export declare function useFormValue<T>(form: FormControl<T>): T;
export declare function useFormValue<T, V extends string>(form: FormControl<T>, field: V): Get<T, V>;
