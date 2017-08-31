import { AnyQueue, Task, Done } from './types';
import { execute } from './execute';

export class Processor<I, O, C = {}> {
    queue: AnyQueue<C> = [];

    constructor(...tasks: AnyQueue<C>) {
        this.queue = tasks;
    }

    pipe<R>(task: Task<O, R, C>) {
        this.queue.push(task);
        return this as any as Processor<I, R, C>;
    }

    run(input: I, done: Done<O>, context: C = {} as C, timeout = 5000) {
        return execute(this.queue, input, context, done, timeout);
    }

    runAsync(input: I, context: C = {} as C, timeout = 5000) {
        return new Promise<O>((resolve, reject) => {
            const done: Done<O> = (err: any, result: any) => err ? reject(err) : resolve(result);
            return execute(this.queue, input, context, done, timeout);
        });
    }

    clone() {
        return new Processor(...this.queue);
    }
}
