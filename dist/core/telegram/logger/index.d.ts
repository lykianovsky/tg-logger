import { TelegramClientOptions } from '../client';
interface TelegramLoggerOptions {
    clientOptions: TelegramClientOptions;
}
type Message = string;
export declare class TelegramLogger {
    private readonly client;
    constructor(options: TelegramLoggerOptions);
    log(message: Message): void;
}
export {};
