import { compose, Processor, Next } from './index';

describe('compose/Processor', () => {
    const f1 = (n: number, next: Next<number>) => setTimeout(() => next(n + 1), 100);
    const f2 = (n: number, next: Next<string>) => next(n.toString());

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

            const q2 = q1.push((s, next: Next<number>) => next(s.length));
            expect(q1._tasks).toHaveLength(3);
            expect(q2._tasks).toHaveLength(3);

            expect(q1).toBe(q2);
        });
    });


    describe('Processor#concat', () => {
        it('add task to queue with immutable and return diffirent instance', () => {
            const q1 = queue;
            expect(q1._tasks).toHaveLength(2);

            const q2 = q1.concat((s, next: Next<number>) => next(s.length));
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
            const f4 = (s: string, next: Next<string>) => s;
            const q = queue.concat(f4);

            q.run(1, (err, result) => {
                expect(err).toBeInstanceOf(Error);
                expect(result).toBeUndefined();
                done();
            }, 200);
        });

        it('is not invoked when next function called with Error', (done) => {
            const errorFn = (v: any, next: Next<number>) => next(new Error('error'));
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
            const f = (v: number, next: Next<number>) => {
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
            const errFn = (v: any, next: Next<number>) => { throw new Error(); };
            const mock = jest.fn(f1) as typeof f1;
            const q = compose(errFn, mock);

            q.run(1, (err, result) => {
                expect(err).toBeInstanceOf(Error);
                expect(result).toBeUndefined();
                expect(mock).not.toBeCalled();
                done();
            });
        });
    });


    describe('Processor#runAsync', () => {
        it('return promise', () => {
            return queue.runAsync(1).then(x => expect(x).toBe('2'));
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

