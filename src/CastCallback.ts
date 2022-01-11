import {AbstractCallback} from "./AbstractCallback";
import {ClassOrName, FuncLike} from "@leyyo/core";
import {Fqn} from "@leyyo/fqn";

@Fqn('leyyo')
export class CastCallback extends AbstractCallback<FuncLike> {
    constructor() {
        super('cast');
    }
    run<T>(clazz: ClassOrName, ...args: Array<unknown>): T {
        const lambda = this.get(clazz);
        return lambda(...args) as T;
    }
}
export const cast = new CastCallback();