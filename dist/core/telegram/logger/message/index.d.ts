export type TelegramLoggerMessageBuilderText = string & {
    __brand: 'finish';
};
export declare class TelegramLoggerMessageBuilder {
    private _text;
    constructor(text?: string);
    space(): this;
    bold(content: string): this;
    italic(content: string): this;
    code(content: string): this;
    underline(content: string): this;
    enter(count?: number): this;
    when(condition: boolean, handler: (context: this) => void): this;
    add(text: string): this;
    get(): TelegramLoggerMessageBuilderText;
}
