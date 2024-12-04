import stringMatch from "../../../shared/utils/stringMatch"
import { FieldPath } from "../../../shared/utils/types"


class Ignore {}
type Method = Ignore | string
type Methods = [Method, Method, Method, Method]

type PathMatcher = (lookup: FieldPath, path: FieldPath) => boolean

export const exact: PathMatcher = (lookup, path) => {
  return (
    stringMatch.exact(lookup.section, path.section) &&
    stringMatch.exact(lookup.fieldType, path.fieldType) &&
    stringMatch.exact(lookup.fieldName, path.fieldName)
  )
}

export const noPage: PathMatcher = (lookup, path) => {
  return (
    stringMatch.exact(lookup.section, path.section) &&
    stringMatch.exact(lookup.fieldType, path.fieldType) &&
    stringMatch.exact(lookup.fieldName, path.fieldName)
  )
}

export const fieldNameStart: PathMatcher = (lookup, path) => {
  return (
    stringMatch.exact(lookup.section, path.section) &&
    stringMatch.exact(lookup.fieldType, path.fieldType) &&
    stringMatch.countMatchingStartCharacters(lookup.fieldName, path.fieldName) > 8
  )
}

export const fieldNameEnd: PathMatcher = (lookup, path) => {
  return (
    stringMatch.exact(lookup.section, path.section) &&
    stringMatch.exact(lookup.fieldType, path.fieldType) &&
    stringMatch.countMatchingEndCharacters(lookup.fieldName, path.fieldName) > 8
  )
}

export const storedFieldNameIsPrefix: PathMatcher = (lookup, path) => {
  return (
    // stringMatch.ignore(lookup.page, path.page) &&
    stringMatch.exact(lookup.section, path.section) &&
    stringMatch.exact(lookup.fieldType, path.fieldType) &&
    stringMatch.startsWith(lookup.fieldName, path.fieldName)
  )
}

export const storedFieldNameIsSuffix: PathMatcher = (lookup, path) => {
  return (
    // stringMatch.ignore(lookup.page, path.page) &&
    stringMatch.exact(lookup.section, path.section) &&
    stringMatch.exact(lookup.fieldType, path.fieldType) &&
    stringMatch.endsWith(lookup.fieldName, path.fieldName)
  )
}

export const storedFieldNameIsSubstring: PathMatcher = (lookup, path) => {
  return (
    // stringMatch.ignore(lookup.page, path.page) &&
    stringMatch.exact(lookup.section, path.section) &&
    stringMatch.exact(lookup.fieldType, path.fieldType) &&
    stringMatch.contains(lookup.fieldName, path.fieldName)
  )
}