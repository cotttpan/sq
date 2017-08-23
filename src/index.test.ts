import { compose, Processor, Task, parallel } from './index';

const CONTEXT = 'CONTEXT';

describe('compose/Processor', () => {
    const context = { CONTEXT };
    const f1: Task<number, number, typeof context> = (n, ctx) => setTimeout(() => ctx.next(n + 1), 100);
    const f2: Task<number, string, typeof context> = (n, ctx) => ctx.next(n.toString());

    let queue = compose(f1, f2);
    beforeEach(() => queue = compose(f1, f2));


    describe('compose', () => {
        it('set tasks in queue', () => {
            expect(queue._tasks.length).toBe(2);
        });

        it('return instance of Processor', () => {
            expect(queue instanceof Processor).toBe(true);
        });
    });


    describe('Processor#push', () => {
        it('add task to queue with mutable and return same instance', () => {
            const q1 = queue;
            expect(q1._tasks).toHaveLength(2);

            const t3: Task<string, number> = (s, ctx) => ctx.next(s.length);

            const q2 = q1.push<number>((s, ctx) => ctx.next(s.length));
            expect(q1._tasks).toHaveLength(3);
            expect(q2._tasks).toHaveLength(3);

            expect(q1).toBe(q2);
        });
    });


    describe('Processor#concat', () => {
        it('add task to queue with immutable and return diffirent instance', () => {
            const q1 = queue;
            expect(q1._tasks).toHaveLength(2);

            const q2 = q1.concat<number>((s, { next }) => next(s.length));
            expect(q1._tasks).toHaveLength(2);
            expect(q2._tasks).toHaveLength(3);

            expect(q1).not.toBe(q2);
        });
    });


    describe('Processor#run', () => {
        it('process tasks', (done) => {
            queue.run(1, (err, result) => {
                expect(err).toBeUndefined();
                expect(result).toBe('2');
                done();
            });
        });

        it('throw error when time expired', (done) => {
            // nextが呼び出されないtask
            const f4: Task<string, string> = (s: string) => s;
            const q = queue.concat(f4);

            q.run(1, (err, result) => {
                expect(err).toBeInstanceOf(Error);
                expect(result).toBeUndefined();
                done();
            }, { CONTEXT }, 200);
        });

        it('is not invoked when next function called with Error', (done) => {
            const errorFn: Task<any, number> = (v: any, { next }) => next(new Error('error'));
            const mock = jest.fn(f1) as typeof f1;
            const q = compose(errorFn, mock);

            q.run(1, (err, result) => {
                expect(err).toBeInstanceOf(Error);
                expect(result).toBeUndefined();
                expect(mock).not.toBeCalled();
                done();
            });
        });

        test('next function called once', (done) => {
            const f: Task<number, number> = (v, { next }) => {
                next(v);
                next(new Error());
                Promise.resolve(v).then(next);
            };

            const m1 = jest.fn(f1);

            const q = compose(f, m1, f2);
            q.run(1, (err, result) => {
                expect(err).toBeUndefined();
                expect(result).toBe('2');
                expect(m1).toHaveBeenCalledTimes(1);
                done();
            });
        });

        test('throw Error in task', (done) => {
            const errFn: Task<any, number> = (v: any, { next }) => { throw new Error(); };
            const mock = jest.fn(f1) as typeof f1;
            const q = compose(errFn, mock);

            q.run(1, (err, result) => {
                expect(err).toBeInstanceOf(Error);
                expect(result).toBeUndefined();
                expect(mock).not.toBeCalled();
                done();
            });
        });

        test('run with context', (done) => {
            const task: Task<string, string, typeof context> = (s, ctx) => {
                expect(ctx.CONTEXT).toBe(CONTEXT);
                ctx.next(ctx.CONTEXT);
            };
            queue.concat(task).run(1, (err, out) => {
                expect(out).toBe(CONTEXT);
                done();
            }, context);
        });
    });


    describe('Processor#runAsync', () => {
        it('return promise', () => {
            return queue.runAsync(1, context).then(x => expect(x).toBe('2'));
        });
    });


    describe('Processor#clone', () => {
        it('return new instance and queue', () => {
            const q2 = queue.clone();
            expect(q2._tasks).not.toBe(queue._tasks);
            expect(q2).not.toBe(queue);
        });
    });
});


describe('parallel', () => {
    const context = { CONTEXT };
    const t1: Task<number, number, typeof context> = (v, { next }) => next(v);
    const t2: Task<number, number, typeof context> = (v, { next }) => setTimeout(() => next(v + 100), 100);
    const t3: Task<number, number, typeof context> = (v, { next }) => next(new Error());

    it('return taks that bundled tasks', () => {
        expect(typeof parallel(t1, t2)).toBe('function');
    });

    it('call next() with result that indexed at once after all bundled task is done', (done) => {
        expect.assertions(2);
        const task = parallel(t2, t1, t2);
        const next = jest.fn();
        task(1, { ...context, next });

        setTimeout(() => {
            expect(next).toBeCalledWith([101, 1, 101]);
            expect(next).toHaveBeenCalledTimes(1);
            done();
        }, 200);
    });

    test('compose queue with parallel', () => {
        const task = parallel(t1, t2);
        return compose(task).runAsync(1)
            .then((r) => expect(r).toEqual([1, 101]));

    });

    test('run with context', () => {
        const task: Task<number, string, typeof context> = (_, ctx) => ctx.next(ctx.CONTEXT);

        return compose(parallel(t1, task, t2)).runAsync(1, context)
            .then(r => expect(r).toEqual([1, CONTEXT, 101]));
    });

    test('with error', () => {
        const task = parallel(t1, t2, t3);
        return compose(task).runAsync(1)
            .catch(err => expect(err).toBeInstanceOf(Error));
    });
});
