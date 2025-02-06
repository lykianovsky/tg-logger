import {TelegramClientThrottle, TelegramClientThrottleOptions} from './throttle'
import {TelegramClientCache, TelegramClientCacheOptions} from './cache'
import {SHA256} from 'crypto-js'
import {TelegramLoggerMessageBuilder} from '../logger/message'
import {TelegramClientMessageLock} from './lock'

export type CacheKey = `cache-key:${string}`
export type UpdatePendingKey = `pending-update:${string}`
export type SendPendingKey = `pending-send:${string}`

export interface TelegramClientOptions {
  token: string
  chatId: string
  cache: {
    maxSize: TelegramClientCacheOptions['maxSize']
    ttl: number
  }
  throttle: TelegramClientThrottleOptions
  debug: boolean
}

export class TelegramClient {
  private readonly _token: TelegramClientOptions['token']
  private readonly _chatId: TelegramClientOptions['chatId']
  private readonly _cacheTTL: TelegramClientOptions['cache']['ttl']
  private readonly _debug: TelegramClientOptions['debug']
  private readonly _cache: TelegramClientCache
  private readonly _pendingMessages = new Map()
  private readonly _throttle: TelegramClientThrottle
  private readonly _lock: TelegramClientMessageLock

  constructor(options: TelegramClientOptions) {
    this._token = options.token
    this._chatId = options.chatId
    this._cacheTTL = options.cache.ttl
    this._debug = options.debug

    this._cache = new TelegramClientCache({
      maxSize: options.cache.maxSize,
    })

    this._throttle = new TelegramClientThrottle(options.throttle)
    this._lock = new TelegramClientMessageLock()
  }

  public async updateMessage(messageId: number, message: string) {
    const hash = SHA256(message)
    const cacheKey: CacheKey = `cache-key:${hash}`
    const pendingKey: UpdatePendingKey = `pending-update:${hash}`

    this.log('Updating message:', {messageId, message, cacheKey, pendingKey})

    await this._lock.with(() =>
      this.executeWithThrottle(
        async () => {
          const headers = new Headers([['Content-Type', 'application/json']])

          const prepareMessage = new TelegramLoggerMessageBuilder(message)
            .enter(2)
            .when(this._cache.has(cacheKey), (context) => {
              const cache = this._cache.get(cacheKey)!
              context.add(`❗️Count: ${cache.count}`)
            })
            .get()

          const body = JSON.stringify({
            chat_id: this._chatId,
            message_id: messageId,
            text: prepareMessage,
            parse_mode: 'html',
          })

          this.log('Sending update request', {body})

          const response = await this.request('/editMessageText', {
            method: 'POST',
            headers,
            body,
          })

          this.log('Update response:', response)
        },
        cacheKey,
        pendingKey,
      ),
    )
  }

  public async sendMessage(message: string) {
    const hash = SHA256(message)
    const cacheKey: CacheKey = `cache-key:${hash}`
    const pendingKey: SendPendingKey = `pending-send:${hash}`

    this.log('Sending message:', {message, cacheKey, pendingKey})

    const execute = async () => {
      const cache = this._cache.get(cacheKey)

      if (cache) {
        this.log('Message found in cache, updating instead')
        this._cache.increment(cacheKey)
        this._pendingMessages.delete(pendingKey)
        this._throttle.decrementRequestCount()
        this.updateMessage(cache.messageId, message)
        return
      }

      const headers = new Headers([['Content-Type', 'application/json']])

      const body = JSON.stringify({
        chat_id: this._chatId,
        text: message,
        parse_mode: 'html',
      })

      this.log('Sending message request', {body})

      const response = await this.request('/sendMessage', {
        method: 'POST',
        headers,
        body,
      })

      this._cache.set(cacheKey, {
        messageId: response.result.message_id,
        count: 1,
        expireAt: this._cacheTTL,
      })
    }

    await this._lock.with(() =>
      this.executeWithThrottle(execute, cacheKey, pendingKey),
    )
  }

  private log(message: string, ...args: any[]) {
    if (this._debug) {
      console.log(`[TelegramClient]: ${message}`, ...args)
    }
  }

  private async executeWithThrottle(
    fn: () => Promise<void>,
    cacheKey: CacheKey,
    pendingKey: UpdatePendingKey | SendPendingKey,
  ) {
    const execute = () =>
      fn()
        .finally(() => {
          this._pendingMessages.delete(pendingKey)
        })
        .catch((error) => {
          this.handleRequestError(error, execute)
        })

    if (this._pendingMessages.has(pendingKey)) {
      this.log('Pending request already exists, waiting...')
      await this._pendingMessages.get(pendingKey)
      return
    }

    if (!this._throttle.can()) {
      this.log('Throttle limit reached, enqueueing request.')
      this._throttle.enqueue(execute)
      return
    }

    if (this._cache.isExpired(cacheKey)) {
      this.log('Cache expired, deleting key:', cacheKey)
      this._cache.delete(cacheKey)
    }

    this._throttle.incrementRequestCount()
    this._pendingMessages.set(pendingKey, execute)

    await execute()
  }

  private async request<Body = any>(
    path: string,
    options?: RequestInit,
  ): Promise<Body> {
    this.log('Sending request:', {path, options})

    const response = await fetch(this.url(path), {
      ...options,
    })
      .then((res) => res.json())
      .catch((error) => error)

    this.log('Response received:', response)

    if (!response?.ok) {
      throw response
    }

    return response
  }

  private handleRequestError(error: any, retryFn: () => Promise<void>) {
    this.log('Request error:', error)

    if (error.error_code === 429) {
      this.log('Rate limit hit, re-enqueueing request.')
      this._throttle.enqueue(retryFn)
    }
  }

  private url(path: string) {
    const pathnameWithBotQuery = `/bot${this._token}${path}`
    return new URL(pathnameWithBotQuery, 'https://api.telegram.org')
  }
}
