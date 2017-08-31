import { compose, Processor, Task, parallel } from './index';

const CONTEXT = 'CONTEXT';

describe('compose/Processor', () => {
    const context = { CONTEXT };
    const f1: Task<number, number, typeof context> = (n, ctx) => setTimeout(() => ctx.next(n + 1), 100);
    const f2: Task<number, string, typeof context> = (n, ctx) => ctx.next(n.toString());

    let processor = compose(f1, f2);
    beforeEach(() => processor = compose(f1, f2));


    describe('compose', () => {
        it('set tasks in queue', () => {
            expect(processor.queue.length).toBe(2);
        });

        it('return instance of Processor', () => {
            expect(processor instanceof Processor).toBe(true);
        });
    });

    describe('#pipe', () => {
        const t3: Task<string, number> = (s, ctx) => ctx.next(s.length);

        it('add task to queue with muttable', () => {
            const p1 = processor;
            const p2 = p1.pipe(t3);
            expect(p1.queue).toHaveLength(3);
            expect(p2.queue).toHaveLength(3);
            expect(p1).toBe(p2);
        });
    });

    describe('#clone', () => {
        const t3: Task<any, any> = () => {/* noop */ };

        it('return new Processor', () => {
            const p1 = processor;
            const p2 = p1.clone().pipe(t3);
            expect(p1.queue).toHaveLength(2);
            expect(p2.queue).toHaveLength(3);
            expect(p1).not.toBe(p2);
        });
    });


    describe('#run', () => {
        it('process tasks', (done) => {
            processor.run(1, (err, result) => {
                expect(err).toBeUndefined();
                expect(result).toBe('2');
                done();
            });
        });

        it('throw error when time expired', (done) => {
            // nextが呼び出されないtask
            const t: Task<string, string> = (s: string) => s;

            processor.clone().pipe(t).run(1, (err, result) => {
                expect(err).toBeInstanceOf(Error);
                expect(result).toBeUndefined();
                done();
            }, { CONTEXT }, 200);
        });

        it('is not invoked when next function called with Error', (done) => {
            const errorFn: Task<any, number> = (v: any, { next }) => next(new Error('error'));
            const mock = jest.fn(f1) as typeof f1;
            const p = compose(errorFn, mock);

            p.run(1, (err, result) => {
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

            const p = compose(f, m1, f2);
            p.run(1, (err, result) => {
                expect(err).toBeUndefined();
                expect(result).toBe('2');
                expect(m1).toHaveBeenCalledTimes(1);
                done();
            });
        });

        test('throw Error in task', (done) => {
            const errFn: Task<any, number> = (v: any, { next }) => { throw new Error(); };
            const mock = jest.fn(f1) as typeof f1;
            const p = compose(errFn, mock);

            p.run(1, (err, result) => {
                expect(err).toBeInstanceOf(Error);
                expect(result).toBeUndefined();
                expect(mock).not.toBeCalled();
                done();
            });
        });

        test('run with context', (done) => {
            const task: Task<string, string, typeof context> = (s, ctx) => {
                expect(ctx.index).toBe(2);
                expect(ctx.CONTEXT).toBe(CONTEXT);
                ctx.next(ctx.CONTEXT);
            };
            processor.clone().pipe(task).run(1, (err, out) => {
                expect(out).toBe(CONTEXT);
                done();
            }, context);
        });
    });


    describe('#runAsync', () => {
        it('return promise', () => {
            return processor.runAsync(1, context).then(x => expect(x).toBe('2'));
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
        task(1, { ...context, next, index: 0 });

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
        const task: Task<number, string, typeof context> = (_, ctx) => {
            expect(ctx.index).toBe(0);
            ctx.next(ctx.CONTEXT);
        };

        return compose(parallel(t1, task, t2)).runAsync(1, context)
            .then(r => expect(r).toEqual([1, CONTEXT, 101]));
    });

    test('with error', () => {
        return compose(parallel(t1, t2, t3)).runAsync(1)
            .catch(err => expect(err).toBeInstanceOf(Error));
    });
});
