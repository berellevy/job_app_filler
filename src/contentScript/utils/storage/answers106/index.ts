import { Answer, AnswerData, FieldPath } from "../../../../shared/utils/types"
import { getMatchingAnswers } from "../answerMatching"
import { clean } from "../utils"


export const getAnswers106 = async (): Promise<any | {}> => {
  return (await chrome.storage.local.get('answers106')).answers106 || {}
}

export const getAnswer106 = async ({
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

export const transferFrom105To106 = async (answers: AnswerData) => {
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