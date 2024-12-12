import { Answer106 } from "@src/shared/utils/types"
import { AnswerDataTypes } from "./types"



export default class AnswerDTO<AnswerDataType extends AnswerDataTypes.Any> {

    answer: AnswerDataType
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

    static from106(answer106: Answer106): AnswerDTO<AnswerDataTypes.Any> {
        const {answer, id, matchType, path: {section, fieldName, fieldType}} = answer106
        return new this({ answer, id, matchType, section, fieldName, fieldType })
    }
}