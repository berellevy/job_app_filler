import { DataType, AnswerDTO } from "./types"


export default class StringDTO {
  dataType: DataType = "string"
  answer: string
  id: number
  matchType: string
  section: string
  fieldName: string

  path: {
    section: string
    fieldName: string
    fieldType: string
  }

  constructor({answer, id, matchType, section, fieldName}) {
    this.answer = answer
    this.id = id
    this.matchType = matchType
    this.section = section
    this.fieldName = fieldName
    this.path = {
      section,
      fieldName,
      fieldType: "TextInput"
    }
    
  }

  
}