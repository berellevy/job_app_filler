class AsyncQueue<T> {
  private static instance: AsyncQueue<any>
  private queue: [() => Promise<T>, any][]
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
  public enqueue(task: () => Promise<T>): Promise<void> {
    let taskComplete: () => void
    const promise = new Promise<void>((resolve) => {
      taskComplete = resolve
    })
    this.queue.push([task, taskComplete])
    this.runNext()
    return promise
  }

  // Run the next task in the queue
  private async runNext(): Promise<void> {
    if (this.running || this.queue.length === 0) {
      return
    }

    this.running = true

    const [task, taskComplete] = this.queue.shift()
    if (task) {
      try {
        await task()
        taskComplete()
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
