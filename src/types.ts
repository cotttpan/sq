export interface Next<T> {
    (value: T | Error | DOMException): any;
}

export interface Context<T> {
    next: Next<T>;
    index: number;
}

export interface Task<I, O, C = {}> {
    (a: I, context: Context<O> & C): any;
}

export interface Done<T> {
    (err: Error | DOMException | undefined, result: T): any;
}

export type AnyQueue<C = {}> = Task<any, any, C>[];
