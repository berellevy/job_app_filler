export const answerValueInitList = (answers: string[]) => {
  return answers.map((answer: string) => [answer, false])
}
const relativeDateOptions = ["today",] as const

export type RelativeDateOptions = typeof relativeDateOptions[number]
export type AbsoluteDateValue = [string, string, string]
export type AnswerValueRelativeDate =
  | {
      relative: true
      value: RelativeDateOptions
    }
  | {
      relative: false
      value: AbsoluteDateValue
    }

export type EditableAnswerValueRelativeDate = {
  relative: boolean
  relativeValue: null | RelativeDateOptions
  absoluteValue: AbsoluteDateValue
}
export const answerValueInitRelativeDate = (
  answerValue: AnswerValueRelativeDate | AbsoluteDateValue
): EditableAnswerValueRelativeDate => {
  if (Array.isArray(answerValue)) {
    return {
      relative: false,
      relativeValue: null,
      absoluteValue: answerValue as AbsoluteDateValue
    }
  }
  const { relative, value } = answerValue
  return {
    relative: Boolean(relative),
    relativeValue: relative ? (value as RelativeDateOptions) : null,
    absoluteValue: !relative ? (value as AbsoluteDateValue ) : ["", "", ""],
  }
}