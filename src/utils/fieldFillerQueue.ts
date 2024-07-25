class AsyncQueue<T> {
  private static instance: AsyncQueue<any>
  private queue: Array<() => Promise<T>>
  private running: boolean

  private constructor() {
    this.queue = []
    this.running = false
  }

  // Singleton instance accessor
  public static getInstance(): AsyncQueue<any> {
    if (!AsyncQueue.instance) {
      AsyncQueue.instance = new AsyncQueue()
    }
    return AsyncQueue.instance
  }

  // Add a task to the queue
  public enqueue(task: () => Promise<T>): void {
    this.queue.push(task)
    this.runNext()
  }

  // Run the next task in the queue
  private async runNext(): Promise<void> {
    if (this.running || this.queue.length === 0) {
      return
    }

    this.running = true

    const task = this.queue.shift()
    if (task) {
      try {
        await task()
      } catch (error) {
        console.error('Task failed', error)
      }
    }

    this.running = false

    // Run the next task
    this.runNext()
  }
}

// Get the singleton instance
const fieldFillerQueue = AsyncQueue.getInstance()
export default fieldFillerQueue
