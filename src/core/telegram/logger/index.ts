import {TelegramClient, TelegramClientOptions} from '../client'
import {TelegramLoggerMessageBuilder} from './message'

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

const cacheExpireTime = Date.now() + 300 * 1000
const throttleInterval = 1000 * 10

const logger = new TelegramLogger({
  clientOptions: {
    chatId: '-1002155204660',
    token: '8055652628:AAH3yyKKiYYQ4yCGSdRnwj0xPj6ZcbUID3o',
    cache: {
      maxSize: 10_000,
      ttl: cacheExpireTime,
    },
    throttle: {
      interval: throttleInterval,
      limit: 20,
      maxSize: 10_000,
    },
    debug: true,
  },
})

const error = new TelegramLoggerMessageBuilder()
  .bold('❗ Server Errors')
  .enter(2)
  .underline('Message:')
  .enter()
  .code('Too many request status code 429')
  .get()

const info = new TelegramLoggerMessageBuilder()
  .bold('🔵 Info')
  .enter(2)
  .underline('Message:')
  .enter()
  .code('Something information for colleagues')
  .get()

const warn = new TelegramLoggerMessageBuilder()
  .bold('🟡 Warning')
  .enter(2)
  .underline('Message:')
  .enter()
  .code('We are a people!!!')
  .get()

logger.log(error)
logger.log(info)
logger.log(warn)
