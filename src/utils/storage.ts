import { FieldPath, FieldSnapshot } from '../workday/baseFormInput'


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
  answers: AnswerData
}


/**
 * Checks for each level in the path and creates it if needed.
 */
export const saveAnswer = async (fieldSnapshot: FieldSnapshot<any>) => {
  const { page, section, fieldType, fieldName, answer } = fieldSnapshot
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


export const getAnswers = async () => {
  return await chrome.storage.local.get("answers")
}



/**
 * If there is a full path match in answers storage we 
 * consider it to have an aswer and object with an answer key is returned.
 * Even if the value is undefined or null or false.
 * 
 * If a full path match is not found, return an empty object.
 */
export type AnswerResponse<AnswerType=any> = {answer: AnswerType} | Record<string, never>

export const getAnswer = async (path: FieldPath) => {
  const {page, section, fieldType, fieldName} = path
  const {answers} = await chrome.storage.local.get("answers")

  const hasAnswer = fieldName in (answers?.[page]?.[section]?.[fieldType] || {})
  if (hasAnswer) {
    return {answer: answers?.[page]?.[section]?.[fieldType]?.[fieldName]}
  } else {
    return {}
  }
  return 
}