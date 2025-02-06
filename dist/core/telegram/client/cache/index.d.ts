type CacheKey = string;
interface CacheValue {
    expireAt: number;
    count: number;
    messageId: number;
}
export interface TelegramClientCacheOptions {
    maxSize: number;
}
export declare class TelegramClientCache {
    private readonly _cache;
    private readonly _maxSize;
    constructor(options: TelegramClientCacheOptions);
    set(key: CacheKey, value: CacheValue): void;
    increment(key: CacheKey): void;
    delete(key: CacheKey): void;
    has(key: CacheKey): boolean;
    get(key: CacheKey): CacheValue | undefined;
    isExpired(key: CacheKey): boolean;
    isStorageCrowded(): boolean;
    clean(percent?: number): void;
}
export {};
