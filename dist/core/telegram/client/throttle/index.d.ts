export interface TelegramClientThrottleOptions {
    limit: number;
    maxSize: number;
    interval: number;
}
export declare class TelegramClientThrottle {
    private readonly _limit;
    private readonly _interval;
    private readonly _maxSize;
    private _queue;
    private _requestCount;
    constructor(options: TelegramClientThrottleOptions);
    incrementRequestCount(): void;
    decrementRequestCount(): void;
    clearRequestCount(): void;
    can(): boolean;
    enqueue(task: () => Promise<void>): void;
    queueSize(): number;
    dequeue(): (() => Promise<void>) | undefined;
    private processQueue;
}
