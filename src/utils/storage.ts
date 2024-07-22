import { FieldPath, FieldSnapshot } from "../formFields/types"

interface AnswerData {
  [sectionName: string]: {
    [fieldType: string]: {
      [fieldName: string]: string
    }
  }
}

interface LocalStorage {
  answers?: AnswerData
}

export const getAnswers = async (): Promise<AnswerData | {}> => {
  return (await chrome.storage.local.get('answers')).answers || {}
}


/**
 * Checks for each level in the path and creates it if needed.
 */
export const saveAnswer = async ({
  section,
  fieldType,
  fieldName,
  answer,
}: FieldSnapshot<any>) => {
  const existingAnswers = await getAnswers()

  if (!(section in existingAnswers)) {
    existingAnswers[section] = {}
  }
  if (!(fieldType in existingAnswers[section])) {
    existingAnswers[section][fieldType] = {}
  }
  existingAnswers[section][fieldType][fieldName] = answer
  const newStorage: LocalStorage = { answers: existingAnswers }
  await chrome.storage.local.set(newStorage)
}


/**
 * Delete answer plus any empty paths.
 * Delete the `fieldName` key and value.
 * if the containing `fieldType` is empty after deletion, delete it.
 * if the containing `section` is empty after deletion, delte it, etc.
 */
export const deleteAnswer = async ({section, fieldType, fieldName}: FieldPath) => {
  const answers = await getAnswers()
  if (fieldName in answers?.[section]?.[fieldType]) {
    delete answers[section][fieldType][fieldName]
  }
  if (Object.keys(answers[section][fieldType]).length === 0) {
    delete answers[section][fieldType]
  }
  if (Object.keys(answers[section]).length === 0) {
    delete answers[section]
  }
  const newStorage: LocalStorage = {answers}
  await chrome.storage.local.set(newStorage)
}



/**
 * If there is a full path match in answers storage we
 * consider it to have an aswer and object with an answer key is returned.
 * Even if the value is undefined or null or false.
 *
 * If a full path match is not found, return an empty object.
 */
export type AnswerResponse<AnswerType = any> =
  | { answer: AnswerType }
  | Record<string, never>

export const getAnswer = async ({
  section,
  fieldType,
  fieldName,
}: FieldPath) => {
  const answers  = await getAnswers()

  const hasAnswer = fieldName in (answers?.[section]?.[fieldType] || {})
  if (hasAnswer) {
    return { answer: answers?.[section]?.[fieldType]?.[fieldName] }
  } else {
    return {}
  }
  return
}
