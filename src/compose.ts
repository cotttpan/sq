import { Processor } from './processor';
import { Task } from './types';

export { compose };

function compose<A, R, C = {}>(f1: Task<A, R, C>): Processor<A, R, C>;
function compose<A1, A2, R, C = {}>(f1: Task<A1, A2, C>, f2: Task<A2, R, C>): Processor<A1, R, C>;
function compose<A1, A2, A3, R, C = {}>(f1: Task<A1, A2, C>, f2: Task<A2, A3, C>, f3: Task<A3, R, C>): Processor<A1, R, C>;
function compose<A1, A2, A3, A4, R, C = {}>(f1: Task<A1, A2, C>, f2: Task<A2, A3, C>, f3: Task<A3, A4, C>, f4: Task<A4, R, C>): Processor<A1, R, C>;
function compose<A1, A2, A3, A4, A5, R, C = {}>(
    f1: Task<A1, A2, C>,
    f2: Task<A2, A3, C>,
    f3: Task<A3, A4, C>,
    f4: Task<A4, A5, C>,
    f5: Task<A5, R, C>): Processor<A1, R, C>;
function compose<A1, A2, A3, A4, A5, A6, R, C = {}>(
    f1: Task<A1, A2, C>,
    f2: Task<A2, A3, C>,
    f3: Task<A3, A4, C>,
    f4: Task<A4, A5, C>,
    f5: Task<A5, A6, C>,
    f6: Task<A6, R, C>): Processor<A1, R, C>;
function compose<A1, A2, A3, A4, A5, A6, A7, R, C = {}>(
    f1: Task<A1, A2, C>,
    f2: Task<A2, A3, C>,
    f3: Task<A3, A4, C>,
    f4: Task<A4, A5, C>,
    f5: Task<A5, A6, C>,
    f6: Task<A6, A7, C>,
    f7: Task<A7, R, C>): Processor<A1, R, C>;
function compose<A1, A2, A3, A4, A5, A6, A7, A8, R, C = {}>(
    f1: Task<A1, A2, C>,
    f2: Task<A2, A3, C>,
    f3: Task<A3, A4, C>,
    f4: Task<A4, A5, C>,
    f5: Task<A5, A6, C>,
    f6: Task<A6, A7, C>,
    f7: Task<A7, A8, C>,
    f8: Task<A8, R, C>): Processor<A1, R, C>;
function compose<A1, A2, A3, A4, A5, A6, A7, A8, A9, R, C = {}>(
    f1: Task<A1, A2, C>,
    f2: Task<A2, A3, C>,
    f3: Task<A3, A4, C>,
    f4: Task<A4, A5, C>,
    f5: Task<A5, A6, C>,
    f6: Task<A6, A7, C>,
    f7: Task<A7, A8, C>,
    f8: Task<A8, A9, C>,
    f9: Task<A9, R, C>): Processor<A1, R, C>;
function compose<A1, A2, A3, A4, A5, A6, A7, A8, A9, A10, R, C = {}>(
    f1: Task<A1, A2, C>,
    f2: Task<A2, A3, C>,
    f3: Task<A3, A4, C>,
    f4: Task<A4, A5, C>,
    f5: Task<A5, A6, C>,
    f6: Task<A6, A7, C>,
    f7: Task<A7, A8, C>,
    f8: Task<A8, A9, C>,
    f9: Task<A9, A10, C>,
    f10: Task<A10, R, C>): Processor<A1, R, C>;
function compose(...tasks: Task<any, any>[]) {
    return new Processor(tasks);
}
