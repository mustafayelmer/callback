import {ClassOrName} from "@leyyo/core";

export interface CallbackLike<T> {
    get bucket(): string;

    get sources(): Record<string, T>;

    get all(): Record<string, T>;

    get(name: ClassOrName): T | undefined;

    has(name: ClassOrName): boolean;

    add(value: T, source: ClassOrName, ...aliases: Array<string>): void;

    remove(source: ClassOrName): number;

    isSource(source: ClassOrName): boolean;

    isAlias(alias: ClassOrName): boolean;

    findAliasesBySource(source: ClassOrName): Array<string>;

    findSourceByAlias(alias: ClassOrName): string | undefined;
}