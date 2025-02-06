import { TelegramClientThrottleOptions } from './throttle';
import { TelegramClientCacheOptions } from './cache';
export type CacheKey = `cache-key:${string}`;
export type UpdatePendingKey = `pending-update:${string}`;
export type SendPendingKey = `pending-send:${string}`;
export interface TelegramClientOptions {
    token: string;
    chatId: string;
    cache: {
        maxSize: TelegramClientCacheOptions['maxSize'];
        ttl: number;
    };
    throttle: TelegramClientThrottleOptions;
    debug: boolean;
}
export declare class TelegramClient {
    private readonly _token;
    private readonly _chatId;
    private readonly _cacheTTL;
    private readonly _debug;
    private readonly _cache;
    private readonly _pendingMessages;
    private readonly _throttle;
    private readonly _lock;
    constructor(options: TelegramClientOptions);
    updateMessage(messageId: number, message: string): Promise<void>;
    sendMessage(message: string): Promise<void>;
    private log;
    private executeWithThrottle;
    private request;
    private handleRequestError;
    private url;
}
