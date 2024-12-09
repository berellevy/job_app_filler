import { sleep } from '@src/shared/utils/async'
import { createKeyboardEvent } from '@src/shared/utils/events'
import {
  AbsoluteDateValue,
  AnswerValueRelativeDate,
  RelativeDateOptions,
} from '../../../../hooks/answerValueInit'
import { addCharacterMutationObserver, getReactProps } from '../../utils'

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

/**
 * After calling the onKeyDown of the month and year inputs
 * we need to wait until the change is reflected. This usually happens very quickly
 * so the while loop doesn't get called too much.
 * When I tested it, the while loop was called once. (berel)
 *
 * In order to update react state properly, the input elements need to be clicked after calling the onkeydown
 * Also, sometimes, we have to send the onKeyDown event more than once for it to work
 *
 */
// export async function fillDatePart(
//   datePartElement: HTMLInputElement,
//   datePartValue: string
// ): Promise<void> {
//   let retries = 1
//   while (!(datePartElement.value === datePartValue) && retries >= 0) {
//     await sleep(100)
//     getReactProps(datePartElement).onKeyDown({
//       nativeEvent: { key: 'Up', setSelectionRange: () => {} },
//       preventDefault: () => {},
//       currentTarget: {
//         value: parseInt(datePartValue) - 1,
//         setSelectionRange: () => {},
//       },
//     })
//     retries--
//   }
//   datePartElement.click()
// }
