import {TelegramClient, TelegramClientOptions} from '../client'

interface TelegramLoggerOptions {
  clientOptions: TelegramClientOptions
}

type Message = string

export class TelegramLogger {
  private readonly client: TelegramClient

  constructor(options: TelegramLoggerOptions) {
    this.client = new TelegramClient(options.clientOptions)
  }

  public log(message: Message) {
    void this.client.sendMessage(message)
  }
}
