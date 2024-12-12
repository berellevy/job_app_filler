import { createKeyboardEvent } from '@src/shared/utils/events'
import {
  AbsoluteDateValue,
  AnswerValueRelativeDate,
  RelativeDateOptions,
} from '../../../../hooks/answerValueInit'
import { addCharacterMutationObserver } from '../../utils'

export function formatDate(date: Date): [string, string, string] {
  return [
    (date.getMonth() + 1).toString(),
    date.getDate().toString(),
    date.getFullYear().toString(),
  ]
}

export function getAbsoluteDate(relativeDateOption: RelativeDateOptions): Date {
  if (relativeDateOption === 'today') {
    return new Date()
  }
}

export const convertRelativeDate = ({
  relative,
  value,
}: AnswerValueRelativeDate): AbsoluteDateValue => {
  if (relative) {
    const date = getAbsoluteDate(value)
    return formatDate(date)
  } else {
    return value as AbsoluteDateValue
  }
}

export const setupChangeListener = (formField) => {
  addCharacterMutationObserver(formField.wrapperElement, () => {
    formField.triggerReactUpdate()
  })
}

/**
 * vastly simplified. But still needs to be clicked.
 */
export async function fillDatePart(
  datePartElement: HTMLInputElement,
  datePartValue: string
): Promise<void> {
  datePartElement.value = (parseInt(datePartValue) - 1).toString()
  datePartElement.dispatchEvent(createKeyboardEvent('keydown', 'ArrowUp'))
  datePartElement.click()
}
