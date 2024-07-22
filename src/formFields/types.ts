export type FieldPath = {
    section: string
    fieldType: string
    fieldName: string
  }
  
  export type FieldSnapshot<AnswerType=any> = FieldPath & {
    answer: AnswerType | null
  }