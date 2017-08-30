import { once } from '@cotto/utils.ts';
import { AnyQueue, Done } from './types';
import { isErrorTarget } from './is-error-target';

export function execute<C = {}>(queue: AnyQueue<C>, input: any, context: C, done: Done<any>, timeout = 5000) {
    let _tick: (v: any) => void;
    let index = -1;
    let tid: any;
    let expired = false;
    const iterable = [...queue][Symbol.iterator]();
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

            if (isErrorTarget(v)) {
                clearTimeout(tid);
                throw v;
            }

            if (expired) {
                clearTimeout(tid);
                throw new Error(`timeout of ${timeout}ms exceeded on queue[${index - 1}]`);
            }

            if (iresult.done) {
                clearTimeout(tid);
                return end(undefined, v);
            }

            if (!expired && typeof iresult.value === 'function') {
                const ctx = Object.assign({}, context, { next: once(tick), index });
                return iresult.value(v, ctx);
            }
        } catch (err) {
            end(err, undefined);
        }
    }(input));
}

