// noinspection JSUnusedGlobalSymbols

import {ClassOrName, HashLike} from "@leyyo/core";
import {CallbackLike} from "./interfaces";

export interface Generics {
    parent?: ClassOrName;
    children?: Array<Generics>;
}
export type GenericLambda<T = unknown, O = HashLike> = (generics: Array<Generics>, value: unknown, opt?: O) => T;
export interface GenericsLike<T = unknown, O = HashLike> extends CallbackLike<GenericLambda<T, O>> {
    run(clazz: ClassOrName, value: unknown, opt?: O): T;
}