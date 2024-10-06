export type miliseconds = number
export type Callback<T> = (() => T) | (() => Promise<T>)



export interface AnswerData {
  [pageName: string]: {
    [sectionName: string]: {
      [fieldType: string]: {
        [fieldName: string]: string
      }
    }
  }
}

export interface LocalStorage {
  answers?: AnswerData
  answers106?: {
    [key: string]: any;
  };
}

export type FieldPath = {
  page?: string
  section: string
  fieldType: string
  fieldName: string
}
export type Answer<T = any> = {
  answer: T
  path: FieldPath | null
  hasAnswer?: boolean
  matchType?: string
  id?: number 
}

/**
 * @param requestId The client sets up a temporary event listener
 * for an event by this name. The server dispatches an event by
 * this name as a response.
 * @param methodName Used by the client to specify which server method to call.
 * @param data the arguments to pass to the server method.
 */
export type RequestBody<Data = any> = {
  requestId: string
  methodName: string
  data?: Data
}

export type RequestParams = {
  target: string
} & RequestBody

export interface RequestEvent<T = any> extends CustomEvent {
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
export type ResponseBody<ResponseData = null> = {
  ok: boolean
  data?: ResponseData
}

/**
 * Always be async for uniformity
 */
export type ServerCallback = (params?: any) => Promise<any>
