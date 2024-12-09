import { FieldPath } from "@src/shared/utils/types"

export const parseKey = (key: string): FieldPath => {
  // there can be colons in the fieldName.
  const [page, section, fieldType, ...fieldName] = key.split(':')
  return { page, section, fieldType, fieldName: fieldName.join(':') }
}
