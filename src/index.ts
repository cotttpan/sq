// ==================================================================
// utils
// ==================================================================
export function once<F extends Function>(f: F): F {
    let invoked = false;
    return wrapped as any;
    function wrapped() {
        if (!invoked) {
            invoked = true;
            return f.apply(null, arguments);
        }
    }
}

// ==================================================================
// types
// ==================================================================
export interface Next<T> {
    (value: T | Error): any;
}

export interface Task<A, R> {
    (a: A, next: Next<R>): any;
}

// ==================================================================
// compose
// ==================================================================
export { compose };

function compose<A, R>(f1: Task<A, R>): Processor<A, R>;
function compose<A1, A2, R>(f1: Task<A1, A2>, f2: Task<A2, R>): Processor<A1, R>;
function compose<A1, A2, A3, R>(f1: Task<A1, A2>, f2: Task<A2, A3>, f3: Task<A3, R>): Processor<A1, R>;
function compose<A1, A2, A3, A4, R>(f1: Task<A1, A2>, f2: Task<A2, A3>, f3: Task<A3, A4>, f4: Task<A4, R>): Processor<A1, R>;
function compose<A1, A2, A3, A4, A5, R>(f1: Task<A1, A2>, f2: Task<A2, A3>, f3: Task<A3, A4>, f4: Task<A4, A5>, f5: Task<A5, R>): Processor<A1, R>;
function compose<A1, A2, A3, A4, A5, A6, R>(
    f1: Task<A1, A2>,
    f2: Task<A2, A3>,
    f3: Task<A3, A4>,
    f4: Task<A4, A5>,
    f5: Task<A5, A6>,
    f6: Task<A6, R>): Processor<A1, R>;
function compose<A1, A2, A3, A4, A5, A6, A7, R>(
    f1: Task<A1, A2>,
    f2: Task<A2, A3>,
    f3: Task<A3, A4>,
    f4: Task<A4, A5>,
    f5: Task<A5, A6>,
    f6: Task<A6, A7>,
    f7: Task<A7, R>): Processor<A1, R>;
function compose<A1, A2, A3, A4, A5, A6, A7, A8, R>(
    f1: Task<A1, A2>,
    f2: Task<A2, A3>,
    f3: Task<A3, A4>,
    f4: Task<A4, A5>,
    f5: Task<A5, A6>,
    f6: Task<A6, A7>,
    f7: Task<A7, A8>,
    f8: Task<A8, R>): Processor<A1, R>;
function compose<A1, A2, A3, A4, A5, A6, A7, A8, A9, R>(
    f1: Task<A1, A2>,
    f2: Task<A2, A3>,
    f3: Task<A3, A4>,
    f4: Task<A4, A5>,
    f5: Task<A5, A6>,
    f6: Task<A6, A7>,
    f7: Task<A7, A8>,
    f8: Task<A8, A9>,
    f9: Task<A9, R>): Processor<A1, R>;
function compose<A1, A2, A3, A4, A5, A6, A7, A8, A9, A10, R>(
    f1: Task<A1, A2>,
    f2: Task<A2, A3>,
    f3: Task<A3, A4>,
    f4: Task<A4, A5>,
    f5: Task<A5, A6>,
    f6: Task<A6, A7>,
    f7: Task<A7, A8>,
    f8: Task<A8, A9>,
    f9: Task<A9, A10>,
    f10: Task<A10, R>): Processor<A1, R>;
function compose(...tasks: Task<any, any>[]) {
    return new Processor(...tasks);
}

// ==================================================================
// Processor
// ==================================================================
export class Processor<T = null, R = null> {
    static compose = compose;

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
        return compose.apply(null, this._tasks.concat(task));
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
        return compose.apply(null, [...this._tasks]);
    }
}

// ==================================================================
// Processor#run
// ==================================================================
export function _run(this: Processor, input: any, done: (err: Error | undefined, output: any) => any, timeout = 5000) {
    let _tick: (v: any) => void;
    let index = -1;
    let tid: any;
    let expired = false;
    const iterable = [...this._tasks][Symbol.iterator]();
    const end = once(done);

    const onTimeout = () => {
        expired = true;
        _tick && _tick(undefined);
    };

    tid = setTimeout(onTimeout, timeout);

    (function tick(v: any): void {
        try {
            ++index;
            _tick = tick;

            const iresult = iterable.next();

            if (v instanceof Error) {
                clearTimeout(tid);
                throw v;
            }

            if (expired) {
                clearTimeout(tid);
                throw new Error(`timeout of ${timeout}ms exceeded on task of queue[${index - 1}]`);
            }

            if (iresult.done) {
                clearTimeout(tid);
                return end(undefined, v);
            }

            if (!expired && typeof iresult.value === 'function') {
                return iresult.value(v, once(tick));
            }
        } catch (err) {
            end(err, undefined);
        }
    }(input));
}
