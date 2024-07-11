import { v4 as uuid4 } from 'uuid'

export type RequestBody = {
  requestId: string
  methodName: string
  data?: any
}

export type RequestParams = {
  target: string
} & RequestBody

export type ResponseBody<T> = {
  ok: boolean
  data?: T
}

export type ResponseParams = {
  requestId: string
} & ResponseBody<any>

interface RequestEvent extends CustomEvent {
  detail: RequestBody
}


class NotFoundError extends Error {}

type ServerCallback = (params?: any) => Promise<any>

export const sendEvent = (eventName: string, detail: any) => {
  const event = new CustomEvent(eventName, { detail })
  document.dispatchEvent(event)
}

/**
 * Create a server in a content script and a client in a web accessible 
 * resource script or vice versa.
 * 
 * define 'routes' on the server to handle requests sent by the client.
 * 
 * ### Example
 * Create a server and client with the same url.
 * Then send requests from the client to the server and recieve responses.
 * ```
 * // urls.js
 * export const CONTENT_SCRIPT_URL = "your_choice_of_url"
 * 
 * // contentScript.js
 * const server = new Server(CONTENT_SCRIPT_URL) 
 * server.register("do_something", (params) => {
 *  return "hello from do_something in the contentScript"
 * })
 * 
 * // inject.js (web_accessible_resource)
 * const client = new Client(CONTENT_SCRIPT_URL)
 * const response = await client.send("do_something")
 * console.log(response.ok)
 * > true
 * console.log(response.data)
 * > "hello from do_something in the contentScript"
 * ```
 */
export class Server {
  url: string
  methods: { [methodName: string]: ServerCallback } = {}

  constructor(url: string) {
    this.url = url
    this.methods = {}
    document.addEventListener(this.url, async (e: RequestEvent) =>
      await this.handleRequest(e)
    )
  }

  async handleRequest(e: RequestEvent) {
    const { requestId, methodName, data } = e.detail
    let result: any,
      ok: boolean = true
    try {
      result = await this.dispatch(methodName, data)
    } catch (err) {
      if (err instanceof NotFoundError) {
        result = { message: `method '${methodName}' not found` }
        ok = false
      } else {
        result = { message: err.message }
        ok = false
      }
    }
    
    this.sendResponse(requestId, ok, result)
  }

  dispatch(methodName: string, data?: any) {
    if (!(methodName in this.methods)) {
      throw new NotFoundError()
    }
    return this.methods[methodName](data)
  }

  sendResponse(requestId: string, ok: boolean, data?: any): void {
    sendEvent(requestId, { ok, data })
  }

  register(methodName: string, callback: ServerCallback) {
    if (methodName in this.methods) {
      throw new Error(`A method named ${methodName} already exists.`)
    }
    this.methods[methodName] = callback
  }
}


export class Client {
  url: string

  constructor(url: string) {
    this.url = url
  }

  send<AnswerType>(
    methodName: string,
    data?: any,
    timeout: number = 5000
  ): Promise<ResponseBody<AnswerType>> {
    const requestId = uuid4()
    return new Promise<ResponseBody<AnswerType>>((resolve, reject) => {
      // setup ResponseEvent listener and
      function eventHandler(event: CustomEvent) {
        document.removeEventListener(requestId, eventHandler)
        resolve(event.detail)
      }
      document.addEventListener(requestId, eventHandler)
      
      // send RequestEvent
      this.sendRequest(requestId, methodName, data)

      // timeout
      setTimeout(() => {
        document.removeEventListener(requestId, eventHandler)
        reject(new Error(`Timeout: ${timeout} ms`))
      }, timeout)
    })
  }

  sendRequest(requestId: string, methodName: string, data?: any) {
    sendEvent(this.url, { requestId, methodName, data })
  }
}
