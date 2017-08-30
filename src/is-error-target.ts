import { compact, contains, getGlobal } from '@cotto/utils.ts';

const _global = getGlobal();
const targetList = compact([Error, _global.DOMException]);

export function isErrorTarget<T extends Error | DOMException>(value: T | any): value is T {
    return contains(targetList, value, (a, b) => b instanceof a);
}
