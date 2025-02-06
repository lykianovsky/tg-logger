type CacheKey = string

interface CacheValue {
  expireAt: number
  count: number
  messageId: number
}

export interface TelegramClientCacheOptions {
  maxSize: number
}

export class TelegramClientCache {
  private readonly _cache = new Map<CacheKey, CacheValue>()
  private readonly _maxSize: TelegramClientCacheOptions['maxSize']

  constructor(options: TelegramClientCacheOptions) {
    this._maxSize = options.maxSize
  }

  public set(key: CacheKey, value: CacheValue) {
    if (this.isStorageCrowded()) {
      this.clean()
    }

    this._cache.set(key, value)
  }

  public increment(key: CacheKey) {
    const cache = this._cache.get(key)
    if (cache) {
      this._cache.set(key, {
        ...cache,
        count: cache.count + 1,
      })
    }
  }

  public delete(key: CacheKey) {
    this._cache.delete(key)
  }

  public has(key: CacheKey) {
    return this._cache.has(key)
  }

  public get(key: CacheKey) {
    return this._cache.get(key)
  }

  public isExpired(key: CacheKey) {
    const cacheValue = this.get(key)

    if (!cacheValue) {
      return true
    }

    return Date.now() > cacheValue.expireAt
  }

  public isStorageCrowded() {
    return this._cache.size >= this._maxSize
  }

  public clean(percent = 0.3) {
    const entries = Array.from(this._cache)
      .sort(({1: previous}, {1: current}) => {
        return previous.expireAt - current.expireAt
      })
      .slice(0, Math.floor(this._cache.size * percent))

    for (const [key] of entries) {
      this.delete(key)
    }
  }
}
