/**
 * A server and client for communicating between sandboxed contexts 
 * Works by send `CustomEvents` to the DOM.
 */

import { v4 as uuid4 } from 'uuid'

/** 
 * TYPES
 */
/**
 * @param requestId The client sets up a temporary event listener 
 * for an event by this name. The server dispatches an event by 
 * this name as a response.
 * @param methodName Used by the client to specify which server method to call.
 * @param data the arguments to pass to the server method.
 */
export type RequestBody<Data=any> = {
  requestId: string
  methodName: string
  data?: Data
}

export type RequestParams = {
  target: string
} & RequestBody

interface RequestEvent<T=any> extends CustomEvent {
  detail: RequestBody<T>
}

/**
 * Fields needed to send a response from the server
 */
export type ResponseParams = {
  requestId: string
} & ResponseBody

/**
 * fields to expect when recieving a response in the client
 */
export type ResponseBody<ResponseData=null> = {
  ok: boolean
  data?: ResponseData
}

/**
 * Always be async for uniformity
 */
type ServerCallback = (params?: any) => Promise<any>


class NotFoundError extends Error {}


/** Util func. */
const sendEvent = (eventName: string, detail: any) => {
  const event = new CustomEvent(eventName, { detail })
  document.dispatchEvent(event)
}

/**
 * Communicate reliably between a contentScript and a script injected
 * into the webpage (web_accessible_resources).
 * 
 * Create a server in a content script and a client in a web accessible 
 * resource script or vice versa.
 * 
 * Define 'routes' on the server to handle requests sent by the client.
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
  private methods: { [methodName: string]: ServerCallback } = {}

  constructor(url: string) {
    this.url = url
    this.methods = {}
    document.addEventListener(this.url, async (e: RequestEvent) =>
      await this.handleRequest(e)
    )
  }

  private async handleRequest(e: RequestEvent) {
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

  /**
   * obtain the method by name and call it with data.
   */
  private dispatch(methodName: string, data?: any) {
    if (!(methodName in this.methods)) {
      throw new NotFoundError()
    }
    return this.methods[methodName](data)
  }

  private sendResponse(requestId: string, ok: boolean, data?: any): void {
    sendEvent(requestId, { ok, data })
  }

  /**
   * Usage: 
   * ```
   * server.register("getResource", async (optional, params) => {
   *  // any view logic
   *  return await getSomeResource(optional, params)
   * })
   * ```
   */
  public register(methodName: string, callback: ServerCallback) {
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


  public send<ResponseData = any>(
    methodName: string,
    data?: any,
    timeout: number = 5000
  ): Promise<ResponseBody<ResponseData>> {
    const requestId = uuid4()
    return new Promise<ResponseBody<ResponseData>>((resolve, reject) => {
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

  private sendRequest(requestId: string, methodName: string, data?: any) {
    sendEvent(this.url, { requestId, methodName, data })
  }
}
