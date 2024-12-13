export type DataType = "string"

export namespace AnswerDataTypes {
    export type relativeDate = string
    export type MonthDayYear = [string, string, string] | relativeDate
    export type MonthYear = [string, string]
    export type File = {
        body: string,
        lastModified: number,
        name: string,
        size: number,
        type: string
    }
    export type Any = MonthDayYear | MonthYear | File | File[] | string | string[] | boolean | number
}