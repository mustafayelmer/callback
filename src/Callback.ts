import {Fqn} from "@leyyo/fqn";
import {Leyyo} from "@leyyo/core";
import {LoggerLike, loggerRepo} from "@leyyo/logger";
export interface AssignResponse {
    bucket: string;
    source: Map<string, unknown>;
    alias: Map<string, string>;
}
@Fqn('leyyo')
export class Callback {
    private static _initialized: boolean;
    // bucket > name > value
    private _sources: Map<string, Map<string, unknown>>;
    // bucket > alies > source
    private _aliases: Map<string, Map<string, string>>;
    private readonly LOG: LoggerLike;

    constructor() {
        if (Callback._initialized) {
            Leyyo.developerError('Already initialized', __filename, {$p: '@leyyo/callback'});
        }
        this.LOG = loggerRepo.assign(this.constructor);
        Leyyo.addPackage('@leyyo/callback');
        Callback._initialized = true;
        this._sources = new Map<string, Map<string, unknown>>();
        this._aliases = new Map<string, Map<string, string>>();
    }

    assign(value: string): AssignResponse {
        const bucket = Leyyo.string(value);
        if (!bucket) {
            Leyyo.developerError('Invalid Bucket', __filename, {bucket: value});
        }
        if (this._sources.has(bucket)) {
            Leyyo.developerError('Duplicated Bucket', __filename, {bucket});
        }
        this._sources.set(bucket, new Map<string, unknown>());
        this._aliases.set(bucket, new Map<string, string>());
        this.LOG.staging.info(`New callback bucket: ${bucket}`);
        return {
            bucket,
            source: this._sources.get(bucket),
            alias: this._aliases.get(bucket),
        }
    }
}
export const callback = new Callback();