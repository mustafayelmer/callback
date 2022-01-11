// noinspection JSUnusedGlobalSymbols
import {ClassOrName, HashLike, Leyyo} from "@leyyo/core";
import {Fqn, fqn} from "@leyyo/fqn";
import {CallbackLike} from "./interfaces";
import {callback} from "./Callback";
import {LoggerLike, loggerRepo} from "@leyyo/logger";

@Fqn('leyyo')
export abstract class AbstractCallback<T = unknown> implements CallbackLike<T> {
    protected readonly _bucket: string;
    protected readonly _sourceMap: Map<string, unknown>;
    protected readonly _aliasMap: Map<string, string>;
    private readonly LOG: LoggerLike;

    protected constructor(value: string) {
        const assigned = callback.assign(value);
        this._bucket = assigned.bucket;
        this._sourceMap = assigned.source;
        this._aliasMap = assigned.alias;
        this.LOG = loggerRepo.assign(this.constructor);

    }

    get bucket(): string {
        return this._bucket;
    }

    add(value: T, source: ClassOrName, ...aliases: Array<string>): void {
        const clazz = fqn.get(source);
        if (!clazz) {
            Leyyo.developerError('Empty source', __filename, this._param(source, 'add'));
        }
        if (!value || !['function', 'object'].includes(typeof value)) {
            Leyyo.developerError('Invalid Value', __filename, this._param(clazz, 'add', {type: typeof value}));
        }
        if (this._sourceMap.has(clazz)) {
            Leyyo.developerError('Duplicated source', __filename, this._param(clazz, 'add'));
        }
        if (this._aliasMap.has(clazz)) {
            Leyyo.developerError('Duplicated alias with source', __filename, this._param(clazz, 'add'));
        }
        if (Leyyo.isArray(aliases)) {
            aliases.forEach((item, index) => {
                const alias = Leyyo.string(item);
                if (!alias) {
                    Leyyo.developerError('Empty alias', __filename, this._param(clazz, 'add', {alias: item, index}));
                }
                if (alias === clazz) {
                    delete aliases[index];
                } else {
                    if (this._sourceMap.has(alias)) {
                        Leyyo.developerError('Duplicated Source with alias', __filename, this._param(clazz, 'add', {alias, index}));
                    }
                    if (this._aliasMap.has(alias)) {
                        Leyyo.developerError('Duplicated alias', __filename, this._param(clazz, 'add', {alias, index}));
                    }
                    aliases[index] = alias;
                }
            });
        }
        this._sourceMap.set(clazz, value);
        if (Leyyo.isArray(aliases)) {
            aliases.forEach(alias => {
                this._aliasMap.set(alias, clazz);
            });
        }
        this.LOG.staging.info(`New class is added: ${clazz}`, {aliases});
    }

    get all(): Record<string, T> {
        const map = this.sources;
        for (const [alias, source] of this._aliasMap.entries()) {
            const value = this._sourceMap.get(source);
            if (map[alias] === undefined && value !== undefined) {
                map[alias] = value as T;
            }
        }
        return map;
    }
    get sources(): Record<string, T> {
        const map: Record<string, T> = {};
        for (const [source, obj] of this._sourceMap.entries()) {
            map[source] = obj as T;
        }
        return map;
    }
    private _param(clazz: unknown, fn?: string, param?: HashLike): HashLike {
        if (!Leyyo.isHash(param)) {
            param = {};
        }
        param.bucket = this._bucket;
        param.clazz = Leyyo.clazz(clazz);
        if (fn) {
            param.fn = fn;
        }
        return param;
    }
    findAliasesBySource(source: ClassOrName): Array<string> {
        const clazz = Leyyo.clazz(source);
        if (!clazz) {
            Leyyo.developerError('Empty source', __filename, this._param(source, 'findAliasesBySource'));
        }
        const aliases: Array<string> = [];
        for (const [alias, source] of this._aliasMap.entries()) {
            if (source === clazz) {
                aliases.push(alias);
            }
        }
        return aliases;
    }

    findSourceByAlias(alias: ClassOrName): string | undefined {
        const clazz = fqn.get(alias);
        if (!clazz) {
            Leyyo.developerError('Empty alias', __filename, this._param(alias, 'findSourceByAlias'));
        }
        return this._aliasMap.get(clazz);
    }

    get(name: ClassOrName): T | undefined {
        const clazz = fqn.get(name);
        if (!clazz) {
            Leyyo.developerError('Empty key', __filename, this._param(name, 'get'));
        }
        if (!this._sourceMap.has(clazz)) {
            if (!this._aliasMap.has(clazz)) {
                Leyyo.developerError('Not found key', __filename, this._param(clazz, 'get'));
            }
            return this._sourceMap.get(this._aliasMap.get(clazz)) as T;
        }
        return this._sourceMap.get(clazz) as T;
    }

    has(name: ClassOrName): boolean {
        const clazz = fqn.get(name);
        if (!clazz) {
            Leyyo.developerError('Empty key', __filename, this._param(name, 'has'));
        }
        return this._sourceMap.has(clazz) || this._aliasMap.has(clazz);
    }

    isAlias(alias: ClassOrName): boolean {
        const clazz = fqn.get(alias);
        if (!clazz) {
            Leyyo.developerError('Empty key', __filename, this._param(alias, 'isAlias'));
        }
        return this._aliasMap.has(clazz);
    }

    isSource(source: ClassOrName): boolean {
        const clazz = fqn.get(source);
        if (!clazz) {
            Leyyo.developerError('Empty key', __filename, this._param(source, 'isSource'));
        }
        return this._sourceMap.has(clazz);
    }

    remove(name: ClassOrName): number {
        const clazz = fqn.get(name);
        if (!clazz) {
            Leyyo.developerError('Empty key', __filename, this._param(name, 'remove'));
        }
        let count = 0;
        let type: string;
        if (!this._sourceMap.has(clazz)) {
            if (!this._aliasMap.has(clazz)) {
                Leyyo.developerError('Not found key', __filename, this._param(clazz, 'remove'));
            }
            this._aliasMap.delete(clazz);
            type = 'alias';
            count++;
        } else {
            this._sourceMap.delete(clazz);
            count++;
            for (const [alias, source] of this._aliasMap.entries()) {
                if (source === clazz) {
                    this._aliasMap.delete(alias);
                    count++;
                }
            }
            type = 'source';
        }
        this.LOG.staging.info(`New class is removed: ${clazz}`, {type, count});
        return count;
    }
}