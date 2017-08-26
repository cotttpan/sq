import { execute } from './execute';

export interface Next<T> {
    (value: T | Error | DOMException): any;
}

export interface Context<T> {
    next: Next<T>;
}

export interface Task<A, R, C = {}> {
    (a: A, context: Context<R> & C): any;
}

export class Processor<T = null, R = null, C = {}> {
    _tasks: Task<any, any, C>[] = [];

    constructor(...tasks: Task<any, any, C>[]) {
        this._tasks = tasks;
    }

    /**
     * add new task with "mutable"
     *
     * @template U
     * @param {Task<R, U, C>} task
     * @returns {Processor<T, U, C>}
     */
    push<U>(task: Task<R, U, C>): Processor<T, U, C> {
        this._tasks.push(task);
        return this as any;
    }

    /**
     * add new task with "immutable"
     *
     * @template U
     * @param {Task<R, U>} task
     * @returns {Processor<T, U, C>}
     */
    concat<U>(task: Task<R, U>): Processor<T, U, C> {
        return new Processor<T, U, C>(...this._tasks, task);
    }

    /**
     * execute queue process
     *
     * @param {*} input
     * @param {((err: Error | undefined, output: any) => any)} done
     * @param {number} [timeout=5000]
     * @returns {void}
     */
    run(input: T, done: (err: Error | undefined, output: R) => any, context: C = {} as C, timeout = 5000) {
        execute.call(this, input, context, done, timeout);
    }

    /**
     * execute queue process with promise
     *
     * @param {T} input
     * @param {number} [timeout=5000]
     * @returns {Promise<R>}
     */
    runAsync(input: T, context?: C, timeout = 5000) {
        return new Promise<R>((resolve, reject) => {
            const done = (err: Error, result: any) => err ? reject(err) : resolve(result);
            execute.call(this, input, context, done, timeout);
        });
    }

    clone(): Processor<T, R, C> {
        return new Processor(...this._tasks);
    }
}
