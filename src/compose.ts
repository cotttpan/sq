import { Processor, Task } from './processor';

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
