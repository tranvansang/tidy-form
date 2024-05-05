import type { Get } from 'type-fest';
import type { SetStateAction } from 'react';
export interface FormControl<T> {
    get(): T;
    get<V extends string>(field: V): Get<T, V>;
    get<V extends string>(fields: V[]): {
        [P in V]: Get<T, P>;
    };
    setAll(action: SetStateAction<T>): void;
    set<V extends string>(field: V, action: SetStateAction<Get<T, V>>): void;
    subscribe(cb: (newVal: T) => any): () => void;
    subscribe<V extends keyof T & string>(field: V, cb: (newVal: Get<T, V>) => any): () => void;
}
export default function makeFormControl<T>(defaultValue?: T): FormControl<T>;
