


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
}