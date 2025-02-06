export type TelegramLoggerMessageBuilderText = string & {__brand: 'finish'}

export class TelegramLoggerMessageBuilder {
  private _text: string = ''

  constructor(text?: string) {
    if (text) {
      this._text = text
    }
  }

  public space() {
    return this.add(' ')
  }

  public bold(content: string): this {
    return this.add(`<b>${content}</b>`)
  }

  public italic(content: string): this {
    return this.add(`<i>${content}</i>`)
  }

  public code(content: string): this {
    return this.add(`<code>${content}</code>`)
  }

  public underline(content: string): this {
    return this.add(`<u>${content}</u>`)
  }

  public enter(count = 1) {
    return this.add('\n'.repeat(count))
  }

  public when(condition: boolean, handler: (context: this) => void) {
    if (condition) {
      handler(this)
    }

    return this
  }

  public add(text: string) {
    this._text += text
    return this
  }

  public get() {
    return this._text as TelegramLoggerMessageBuilderText
  }
}
