import { FieldSnapshot } from '../workday/baseFormInput'


const CUSTOM_EVENT_MESSAGE_NAME: string = 'JAFMessage'

export type MessageType = 'SaveRequest' | 'SaveResponse'


export const registerContentScriptEventHandler = () => {
  document.addEventListener(CUSTOM_EVENT_MESSAGE_NAME, (e: CustomEvent) => {
    contentScriptDispatch(e)
  })
}

const contentScriptMethods: { [methodName: string]: ({}) => Promise<any> } = {}
export const contentScriptDispatch = (e: CustomEvent) => {
  const messageType = e.detail.messageType
  contentScriptMethods[messageType](e.detail).then()
}

const sendEvent = (
  target: Node,
  messageType: MessageType,
  from: string,
  data: any
) => {
  const event = new CustomEvent(CUSTOM_EVENT_MESSAGE_NAME, {
    detail: {
      from,
      data,
      messageType,
    },
  })
  target.dispatchEvent(event)
}

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
}

export type SaveRequestDetail = {
  from: string
  data: FieldSnapshot
  type: MessageType
}
export const saveRequest = (from: string, data: FieldSnapshot) => {
  sendEvent(document, 'SaveRequest', from, data)
}
contentScriptMethods['SaveRequest'] = async (detail: SaveRequestDetail) => {
  const { page, section, fieldType, fieldName, answer } = detail.data
  const existingAnswers =
    (await chrome.storage.local.get(['answers'])).answers || {}

  if (!(page in existingAnswers)) {
    existingAnswers[page] = {}
  }
  if (!(section in existingAnswers[page])) {
    existingAnswers[page][section] = {}
  }
  if (!(fieldType in existingAnswers[page][section])) {
    existingAnswers[page][section][fieldType] = {}
  }
  existingAnswers[page][section][fieldType][fieldName] = answer
  const newStorage: LocalStorage = { answers: existingAnswers }
  await chrome.storage.local.set(newStorage)
}
