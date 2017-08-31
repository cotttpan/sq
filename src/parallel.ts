import { Task } from './types';
import { afterOnce, bundle } from '@cotto/utils.ts';
import { isErrorTarget } from './is-error-target';

export { parallel };
function parallel<A, R1, R2, C = {}>(t1: Task<A, R1, C>, t2: Task<A, R2, C>): Task<A, [R1, R2], C>;
function parallel<A, R1, R2, R3, C = {}>(t1: Task<A, R1, C>, t2: Task<A, R2, C>, t3: Task<A, R3, C>): Task<A, [R1, R2, R3], C>;
function parallel<A, R1, R2, R3, R4, C = {}>(
    t1: Task<A, R1, C>,
    t2: Task<A, R2, C>,
    t3: Task<A, R3, C>,
    t4: Task<A, R4, C>): Task<A, [R1, R2, R3, R4], C>;
function parallel<A, R1, R2, R3, R4, R5, C = {}>(
    t1: Task<A, R1, C>,
    t2: Task<A, R2, C>,
    t3: Task<A, R3, C>,
    t4: Task<A, R4, C>,
    t5: Task<A, R5, C>
): Task<A, [R1, R2, R3, R4, R5], C>;
function parallel<A, R1, R2, R3, R4, R5, R6, C = {}>(
    t1: Task<A, R1, C>,
    t2: Task<A, R2, C>,
    t3: Task<A, R3, C>,
    t4: Task<A, R4, C>,
    t5: Task<A, R5, C>,
    t6: Task<A, R6, C>
): Task<A, [R1, R2, R3, R4, R5, R6], C>;
function parallel<A, R1, R2, R3, R4, R5, R6, R7, C = {}>(
    t1: Task<A, R1, C>,
    t2: Task<A, R2, C>,
    t3: Task<A, R3, C>,
    t4: Task<A, R4, C>,
    t5: Task<A, R5, C>,
    t6: Task<A, R6, C>,
    t7: Task<A, R7, C>
): Task<A, [R1, R2, R3, R4, R5, R6, R7], C>;
function parallel<A, R1, R2, R3, R4, R5, R6, R7, R8, C = {}>(
    t1: Task<A, R1, C>,
    t2: Task<A, R2, C>,
    t3: Task<A, R3, C>,
    t4: Task<A, R4, C>,
    t5: Task<A, R5, C>,
    t6: Task<A, R6, C>,
    t7: Task<A, R7, C>,
    t8: Task<A, R8, C>
): Task<A, [R1, R2, R3, R4, R5, R6, R7, R8], C>;
function parallel<A, R1, R2, R3, R4, R5, R6, R7, R8, R9, C = {}>(
    t1: Task<A, R1, C>,
    t2: Task<A, R2, C>,
    t3: Task<A, R3, C>,
    t4: Task<A, R4, C>,
    t5: Task<A, R5, C>,
    t6: Task<A, R6, C>,
    t7: Task<A, R7, C>,
    t8: Task<A, R8, C>,
    t9: Task<A, R9, C>
): Task<A, [R1, R2, R3, R4, R5, R6, R7, R8, R9], C>;
function parallel<A, R1, R2, R3, R4, R5, R6, R7, R8, R9, R10, C = {}>(
    t1: Task<A, R1, C>,
    t2: Task<A, R2, C>,
    t3: Task<A, R3, C>,
    t4: Task<A, R4, C>,
    t5: Task<A, R5, C>,
    t6: Task<A, R6, C>,
    t7: Task<A, R7, C>,
    t8: Task<A, R8, C>,
    t9: Task<A, R9, C>,
    t10: Task<A, R10, C>
): Task<A, [R1, R2, R3, R4, R5, R6, R7, R8, R9, R10], C>;
function parallel<A, C = {}>(...tasks: Task<A, any, C>[]): Task<A, any[], C>;
function parallel(...tasks: Task<any, any>[]): Task<any, any[]> {
    return (value, context) => {
        const result: any[] = [];
        const expose = afterOnce(tasks.length, done);

        for (let i = 0; i < tasks.length; i++) {
            const next = bundle((v: any) => result[i] = v, expose);
            const ctx = Object.assign({}, context, { next, index: context.index });
            tasks[i].call(null, value, ctx);
        }

        function done() {
            const err = result.find(isErrorTarget);
            err ? context.next(err) : context.next(result);
        }
    };
}
