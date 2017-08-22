import { run as _run } from './run';
export interface Next<T> {
    (value: T | Error): any;
}

export interface Task<A, R> {
    (a: A, next: Next<R>): any;
}

export class Processor<T = null, R = null> {
    _tasks: Task<any, any>[] = [];

    constructor(...tasks: Task<any, any>[]) {
        this._tasks = tasks;
    }

    /**
     * add new task with "mutable"
     *
     * @template U
     * @param {Task<R, U>} task
     * @returns {Processor<T, U>}
     */
    push<U>(task: Task<R, U>): Processor<T, U> {
        this._tasks.push(task);
        return this as any;
    }

    /**
     * add new task with "immutable"
     *
     * @template U
     * @param {Task<R, U>} task
     * @returns {Processor<T, U>}
     */
    concat<U>(task: Task<R, U>): Processor<T, U> {
        return new Processor(...this._tasks, task);
    }

    /**
     * execute queue process
     *
     * @param {*} input
     * @param {((err: Error | undefined, output: any) => any)} done
     * @param {number} [timeout=5000]
     * @returns {void}
     */
    run(input: T, done: (err: Error | undefined, output: R) => any, timeout = 5000) {
        _run.call(this, input, done, timeout);
    }

    /**
     * execute queue process with promise
     *
     * @param {T} input
     * @param {number} [timeout=5000]
     * @returns {Promise<R>}
     */
    runAsync(input: T, timeout = 5000) {
        return new Promise<R>((resolve, reject) => {
            const done = (err: Error, result: any) => err ? reject(err) : resolve(result);
            _run.call(this, input, done, timeout);
        });
    }

    clone(): Processor<T, R> {
        return new Processor(...this._tasks);
    }
}
