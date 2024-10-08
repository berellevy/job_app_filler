import { FieldPath, AnswerData, Answer, LocalStorage } from '../types'
import { getMatchingAnswers } from './answerMatching'
import { buildKey, clean, parseKey } from './utils'

export const getAnswers = async (): Promise<AnswerData | {}> => {
  return (await chrome.storage.local.get('answers')).answers || {}
}

export const getAnswers106 = async (): Promise<any | {}> => {
  return (await chrome.storage.local.get('answers106')).answers106 || {}
}

/**
 * Checks for each level in the path and creates it if needed.
 */
export const saveAnswer = async ({ path, answer }: Answer): Promise<Answer> => {
  const existingAnswers = await getAnswers106()
  const key = buildKey(path)
  existingAnswers[key] = answer
  const newStorage: LocalStorage = { answers106: existingAnswers }
  await chrome.storage.local.set(newStorage)

  saveAnswer105({
    path,
    answer,
  })
  return {path, answer}
}

const saveAnswer105 = async ({
  path: { page, section, fieldType, fieldName },
  answer,
}: Answer) => {
  const existingAnswers = await getAnswers()

  if (!(page in existingAnswers)) {
    existingAnswers[page] = {}
  }
  if (!(section in existingAnswers[page])) {
    existingAnswers[page][section] = {}
  }
  if (!(fieldType in existingAnswers[page][section])) {
    existingAnswers[page][section][fieldType] = {}
  }
  existingAnswers[page][section][fieldType][clean(fieldName)] = answer

  // Backward compatibility: remove answer key if it has a star
  delete existingAnswers[page][section][fieldType][clean(fieldName) + '*']

  const newStorage: LocalStorage = { answers: existingAnswers }
  await chrome.storage.local.set(newStorage)
}

/**
 * Delete answer plus any empty paths.
 * Delete the `fieldName` key and value.
 * if the containing `fieldType` is empty after deletion, delete it.
 * if the containing `section` is empty after deletion, delte it, etc.
 */
export const deleteAnswer = async ({
  page,
  section,
  fieldType,
  fieldName,
}: FieldPath) => {
  const answers = await getAnswers106()
  const key = buildKey({ page, section, fieldType, fieldName })
  delete answers[key]
  const newStorage: LocalStorage = { answers106: answers }
  await chrome.storage.local.set(newStorage)
  deleteAnswer105({ page, section, fieldName, fieldType })
}

const deleteAnswer105 = async ({
  page,
  section,
  fieldType,
  fieldName,
}: FieldPath) => {
  const answers = await getAnswers()
  if (clean(fieldName) in answers?.[page]?.[section]?.[fieldType]) {
    delete answers[page][section][fieldType][clean(fieldName)]
  } else if (
    clean(fieldName) + '*' in
    answers?.[page]?.[section]?.[fieldType + '*']
  ) {
    delete answers[page][section][fieldType][clean(fieldName) + '*']
  }
  if (Object.keys(answers[page][section][fieldType]).length === 0) {
    delete answers[page][section][fieldType]
  }
  if (Object.keys(answers[page][section]).length === 0) {
    delete answers[page][section]
  }

  if (Object.keys(answers[page]).length === 0) {
    delete answers[page]
  }
  const newStorage: LocalStorage = { answers }
  await chrome.storage.local.set(newStorage)
}

/**
 * If there is a full path match in answers storage we
 * consider it to have an aswer and object with an answer key is returned.
 * Even if the value is undefined or null or false.
 *
 * If a full path match is not found, return an empty object.
 */

export const getAnswer = async (fieldPath: FieldPath): Promise<Answer[]> => {
  let response: Answer[] | Answer
  response = await getAnswer106(fieldPath)

  if (response.length > 0) {
    return response
  }
  response = await getAnswer105(fieldPath)
  if (response.hasAnswer) {
    return [response]
  }
  return []
}

const getAnswer106 = async ({
  page,
  section,
  fieldType,
  fieldName,
}: FieldPath): Promise<Answer[]> => {
  const answers106 = await getAnswers106()
  const answerArray = Object.entries(answers106)
  const matchingAnswers = getMatchingAnswers(
    { page, section, fieldType, fieldName },
    answerArray
  )
  return matchingAnswers
}

const getAnswer105 = async ({
  page,
  section,
  fieldType,
  fieldName,
}: FieldPath): Promise<Answer> => {
  const answers = await getAnswers()
  const response: Answer = {
    answer: null,
    path: { page, section, fieldType, fieldName },
    hasAnswer: false,
  }
  if (clean(fieldName) in (answers?.[page]?.[section]?.[fieldType] || {})) {
    await transferFrom105To106(answers)
    response.answer =
      answers?.[page]?.[section]?.[fieldType]?.[clean(fieldName)]
    response.hasAnswer = true
  } else if (
    clean(fieldName) + '*' in
    (answers?.[page]?.[section]?.[fieldType] || {})
  ) {
    response.answer =
      answers?.[page]?.[section]?.[fieldType]?.[clean(fieldName) + '*']
    response.hasAnswer = true
    await saveAnswer({
      path: { page, section, fieldType, fieldName: clean(fieldName) },
      answer: response.answer,
    })
    await transferFrom105To106(answers)
  }
  return response
}

const transferFrom105To106 = async (answers: AnswerData) => {
  const newdata = {}
  for (const page in answers) {
    const pageData = answers[page]
    for (const section in pageData) {
      const sectionData = pageData[section]
      for (const fieldType in sectionData) {
        const fieldTypeData = sectionData[fieldType]
        for (const fieldName in fieldTypeData) {
          let key: string
          if (clean(fieldName) in fieldTypeData) {
            key = clean(fieldName)
          } else if (clean(fieldName) + '*' in fieldTypeData) {
            key = clean(fieldName) + '*'
          }
          newdata[`${page}:${section}:${fieldType}:${clean(fieldName)}`] =
            fieldTypeData[key]
        }
      }
    }
  }
  chrome.storage.local.set({ answers, answers106: newdata })
}
