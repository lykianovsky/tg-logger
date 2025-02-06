type Queue = (() => Promise<void>)[]

export interface TelegramClientThrottleOptions {
  limit: number
  maxSize: number
  interval: number
}

export class TelegramClientThrottle {
  private readonly _limit: TelegramClientThrottleOptions['limit']
  private readonly _interval: TelegramClientThrottleOptions['interval']
  private readonly _maxSize: TelegramClientThrottleOptions['maxSize']
  private _queue: Queue = []
  private _requestCount = 0

  constructor(options: TelegramClientThrottleOptions) {
    this._limit = options.limit
    this._interval = options.interval
    this._maxSize = options.maxSize

    setInterval(() => {
      this.processQueue().catch((error) => console.log(error))
    }, this._interval)
  }

  public incrementRequestCount() {
    this._requestCount++
  }

  public decrementRequestCount() {
    this._requestCount--
  }

  public clearRequestCount() {
    this._requestCount = 0
  }

  public can() {
    const isLimitNotOverflow = this._requestCount < this._limit
    const isMaxSizeNotOverflow = this.queueSize() < this._maxSize

    return isLimitNotOverflow && isMaxSizeNotOverflow
  }

  public enqueue(task: () => Promise<void>) {
    this._queue.push(task)
  }

  public queueSize() {
    return this._queue.length
  }

  public dequeue() {
    return this._queue.shift()
  }

  private async processQueue() {
    this.clearRequestCount()

    console.log(
      'start processQueue',
      this.can() && this.queueSize() > 0,
      this.queueSize(),
    )

    while (this.can() && this.queueSize() > 0) {
      const task = this.dequeue()
      if (task) {
        this.incrementRequestCount()
        await task()
      }
    }

    console.log('waiting next process')
  }
}
