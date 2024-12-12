type TaskType = (() => void) | (() => Promise<void>)

/**
 * 
 * @param completedKey Unique string (make sure it's unique so it doesn't clobber any other task)
 * @param task sync or async function to run once and only once.
 * @param errorHandler custom error handler, default is `console.error`
 */
export default class OneOffTask {
    private completedKey: string
    task: TaskType
    private errorHandler: (error: Error) => void

    constructor(completedKey: string, task: TaskType, errorHandler = console.error) {
        this.completedKey = completedKey
        this.task = task
        this.errorHandler = errorHandler
    }

    private async isCompleted(): Promise<boolean> {
        const data = await chrome.storage.local.get(this.completedKey)
        return !!data[this.completedKey]
    }

    private async markComplete(): Promise<void> {
        await chrome.storage.local.set({ [this.completedKey]: true })
    }

    public async markIncomplete(): Promise<void> {
        await chrome.storage.local.remove(this.completedKey)
    }

    public async run(): Promise<void> {
        try {
            if (await this.isCompleted()) {
                return
            }
            const result = this.task()
            if (result instanceof Promise) {
                await result
            }
            console.log("task completed: ", this.completedKey);
            this.markComplete()
        } catch (error) {
            this.errorHandler(error)
        }
    }
}
