import { ResponseBody } from "../types"
import { v4 as uuid4 } from 'uuid'
/** Util func. */
const sendEvent = (eventName: string, detail: any) => {
    const event = new CustomEvent(eventName, { detail })
    document.dispatchEvent(event)
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
  