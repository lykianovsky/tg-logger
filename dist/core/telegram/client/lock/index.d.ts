export declare class TelegramClientMessageLock {
    private _lock;
    with<T>(fn: () => Promise<T>): Promise<T>;
}
