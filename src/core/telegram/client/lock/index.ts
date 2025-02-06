export class TelegramClientMessageLock {
  private _lock: Promise<void> = Promise.resolve()

  public async with<T>(fn: () => Promise<T>): Promise<T> {
    let release!: () => void
    const previousLock = this._lock

    this._lock = new Promise<void>((resolve) => {
      release = resolve
    })

    try {
      await previousLock
      return await fn()
    } finally {
      release()
    }
  }
}
