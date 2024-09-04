import { lowerCase, startCase, upperFirst } from "lodash"
import { FieldPath } from "../types"

export const buildKey = ({
  page,
  section,
  fieldType,
  fieldName,
}: FieldPath) => {
  return `${page}:${section}:${fieldType}:${clean(fieldName)}`
}
export const parseKey = (key: string): FieldPath => {
  // there can be colons in the fieldName.
  const [page, section, fieldType, ...fieldName] = key.split(':')
  return { page, section, fieldType, fieldName: fieldName.join(':') }
}

export const clean = (fieldName: string) => {
  return fieldName.replace(/\*$/, '')
}


export const sentenceCase = (str: string): string => {
  return upperFirst(startCase(str).toLowerCase())
}