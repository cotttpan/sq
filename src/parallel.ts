import { Task } from './processor';
import { justOnTime, bundle } from '@cotto/utils.ts';

export { parallel };
function parallel<A, R1, R2>(t1: Task<A, R1>, t2: Task<A, R2>): Task<A, [R1, R2]>;
function parallel<A, R1, R2, R3>(t1: Task<A, R1>, t2: Task<A, R2>, t3: Task<A, R3>): Task<A, [R1, R2, R3]>;
function parallel<A, R1, R2, R3, R4>(
    t1: Task<A, R1>,
    t2: Task<A, R2>,
    t3: Task<A, R3>,
    t4: Task<A, R4>): Task<A, [R1, R2, R3, R4]>;
function parallel<A, R1, R2, R3, R4, R5>(
    t1: Task<A, R1>,
    t2: Task<A, R2>,
    t3: Task<A, R3>,
    t4: Task<A, R4>,
    t5: Task<A, R5>
): Task<A, [R1, R2, R3, R4, R5]>;
function parallel<A, R1, R2, R3, R4, R5, R6>(
    t1: Task<A, R1>,
    t2: Task<A, R2>,
    t3: Task<A, R3>,
    t4: Task<A, R4>,
    t5: Task<A, R5>,
    t6: Task<A, R6>
): Task<A, [R1, R2, R3, R4, R5, R6]>;
function parallel<A, R1, R2, R3, R4, R5, R6, R7>(
    t1: Task<A, R1>,
    t2: Task<A, R2>,
    t3: Task<A, R3>,
    t4: Task<A, R4>,
    t5: Task<A, R5>,
    t6: Task<A, R6>,
    t7: Task<A, R7>
): Task<A, [R1, R2, R3, R4, R5, R6, R7]>;
function parallel<A, R1, R2, R3, R4, R5, R6, R7, R8>(
    t1: Task<A, R1>,
    t2: Task<A, R2>,
    t3: Task<A, R3>,
    t4: Task<A, R4>,
    t5: Task<A, R5>,
    t6: Task<A, R6>,
    t7: Task<A, R7>,
    t8: Task<A, R8>
): Task<A, [R1, R2, R3, R4, R5, R6, R7, R8]>;
function parallel<A, R1, R2, R3, R4, R5, R6, R7, R8, R9>(
    t1: Task<A, R1>,
    t2: Task<A, R2>,
    t3: Task<A, R3>,
    t4: Task<A, R4>,
    t5: Task<A, R5>,
    t6: Task<A, R6>,
    t7: Task<A, R7>,
    t8: Task<A, R8>,
    t9: Task<A, R9>
): Task<A, [R1, R2, R3, R4, R5, R6, R7, R8, R9]>;
function parallel<A, R1, R2, R3, R4, R5, R6, R7, R8, R9, R10>(
    t1: Task<A, R1>,
    t2: Task<A, R2>,
    t3: Task<A, R3>,
    t4: Task<A, R4>,
    t5: Task<A, R5>,
    t6: Task<A, R6>,
    t7: Task<A, R7>,
    t8: Task<A, R8>,
    t9: Task<A, R9>,
    t10: Task<A, R10>
): Task<A, [R1, R2, R3, R4, R5, R6, R7, R8, R9, R10]>;
function parallel<A>(task: Task<A, any>, ...tasks: Task<A, any>[]): Task<A, any[]>;
function parallel<A>(...tasks: Task<A, any>[]): Task<A, any[]> {
    return (value, next) => {
        const result: any[] = [];
        const tick = justOnTime(tasks.length, done);

        for (let i = 0; i < tasks.length; i++) {
            tasks[i].call(null, value, bundle((v: any) => result[i] = v, tick));
        }

        function done() {
            const err = result.find(r => r instanceof Error);
            err ? next(err) : next(result);
        }
    };
}
