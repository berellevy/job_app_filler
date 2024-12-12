import { Answer } from "@src/shared/utils/types"



export default class AnswerDTO {
    answer: string
    id: number
    matchType: string
    section: string
    fieldName: string
    fieldType: string

    path: {
        section: string
        fieldName: string
        fieldType: string
    }

    constructor({ answer, id, matchType, section, fieldName, fieldType }) {
        this.answer = answer
        this.id = id
        this.matchType = matchType
        this.section = section
        this.fieldName = fieldName
        this.path = {
            section,
            fieldName,
            fieldType,
        }
    }

    static from106(answer106: Answer): AnswerDTO {
        const {answer, id, matchType, path: {section, fieldName, fieldType}} = answer106
        return new this({ answer, id, matchType, section, fieldName, fieldType })
    }
}