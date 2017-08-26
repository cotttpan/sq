import { Processor } from './processor';
import { once } from '@cotto/utils.ts';

export function execute(this: Processor, input: any, context: any, done: (err: Error | undefined, output: any) => any, timeout = 5000) {
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

            if (DOMException && v instanceof DOMException) {
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
                const ctx = Object.assign({}, context, { next: once(tick) });
                return iresult.value(v, ctx);
            }
        } catch (err) {
            end(err, undefined);
        }
    }(input));
}
