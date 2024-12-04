import { Answer, FieldPath } from '../types'
import { parseKey } from './utils'
import * as comparePath from './comparePath'

type MethodNames = keyof typeof comparePath

export const getMatchingAnswers = (
  lookup: FieldPath,
  answers: [string, any][]
): Answer[] => {
  const compareMethods: MethodNames[] = [
    'exact',
    'noPage',
    'storedFieldNameIsPrefix',
    'storedFieldNameIsSuffix',
    'storedFieldNameIsSubstring',
    'fieldNameStart',
    'fieldNameEnd',
  ]
  const matches = compareMethods.reduce<any>((matchDict, method) => {
    matchDict[method] = []
    return matchDict
  }, {})

  for (const answer of answers) {
    const [answerKey, answerValue] = answer
    const parsedKey = parseKey(answerKey)
    const foundAnswer = {
      answer: answerValue,
      hasAnswer: true,
    }
    for (const method of compareMethods) {
      if (comparePath[method](lookup, parsedKey)) {
        matches[method].push({
          answer: answerValue,
          path: parsedKey,
          hasAnswer: true,
          matchType: method,
        })
        break
      }
    }
  }
  const result = compareMethods.reduce<any>((acc, method) => {
    return acc.concat(matches[method])
  }, [])
  return result
}
