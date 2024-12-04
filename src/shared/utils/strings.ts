import { lowerCase, startCase, upperFirst } from "lodash"

export const sentenceCase = (str: string): string => {
  return upperFirst(startCase(str).toLowerCase())
}