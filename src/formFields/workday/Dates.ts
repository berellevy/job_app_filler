import { sleep } from '../../utils/async'
import fieldFillerQueue from '../../utils/fieldFillerQueue'
import { getElement } from '../../utils/getElements'
import { Answer } from '../../utils/types'
import { AnswerValueMethods } from '../baseFormInput'
import { WorkdayBaseInput } from './workdayBaseInput'
import * as xpaths from './xpaths'
import { AnswerValueSingleDate } from '../../components/AnswerValueDisplayComponents/AnswerValueSingleDate'
import { AnswerValueSingleRelativeDate } from '../../components/AnswerValueDisplayComponents/AnswerValueSingleRelativeDate'
import {
  AbsoluteDateValue,
  answerValueInitRelativeDate,
  AnswerValueRelativeDate,
  EditableAnswerValueRelativeDate,
  RelativeDateOptions,
} from '../../hooks/answerValueInit'
import { saveButtonClickHandlers, SaveButtonClickHndler } from '../../hooks/saveButtonClickHandlers'
import { getReactProps } from '../utils'

function formatDate(date: Date): [string, string, string] {
  return [
    (date.getMonth() + 1).toString(),
    date.getDate().toString(),
    date.getFullYear().toString(),
  ]
}

function getAbsoluteDate(relativeDateOption: RelativeDateOptions): Date {
  if (relativeDateOption === 'today') {
    return new Date()
  }
}

const convertRelativeDate = ({
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

function dateCompare(date1: string[], date2: string[]): boolean {
  if (date1.length !== date2.length) {
    return false
  }
  for (let i = 0; i < date1.length; i++) {
    if (date1[i] !== date2[i]) {
      return false
    }
  }
  return true
}

const setupChangeListener = (formField) => {
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'characterData') {
        formField.triggerReactUpdate()
      }
    }
  })
  observer.observe(formField.wrapperElement, {
    characterData: true,
    childList: true,
    subtree: true,
  })
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
async function fillDatePart(
  datePartElement: HTMLInputElement,
  datePartValue: string
): Promise<void> {
  let retries = 20
  while (!(datePartElement.value === datePartValue) && retries >= 0) {
    await sleep(50)
    getReactProps(datePartElement).onKeyDown({
      nativeEvent: { key: 'Up', setSelectionRange: () => {} },
      preventDefault: () => {},
      currentTarget: {
        value: parseInt(datePartValue) - 1,
        setSelectionRange: () => {},
      },
    })
    retries--
  }
  datePartElement.click()
}

export class MonthYear extends WorkdayBaseInput<[string, string]> {
  static XPATH = xpaths.MONTH_YEAR
  fieldType = 'MonthYear'
  public answerValueDisplayComponent = AnswerValueSingleDate
  get answerValue() {
    return {
      ...super.answerValue,
      displayComponent: AnswerValueSingleDate,
    }
  }
  listenForChanges(): void {
    setupChangeListener(this)
  }

  get monthInputElement(): HTMLInputElement {
    return getElement(
      this.element,
      ".//input[@aria-label='Month']"
    ) as HTMLInputElement
  }

  get yearInputElement(): HTMLInputElement {
    return getElement(
      this.element,
      ".//input[@aria-label='Year']"
    ) as HTMLInputElement
  }
  currentValue() {
    return [this.monthInputElement.value, this.yearInputElement.value]
  }

  get wrapperElement(): HTMLElement {
    return getElement(
      this.element,
      ".//div[@data-automation-id='dateInputWrapper']"
    )
  }

  /**
   * Compare only the first stored date.
   */
  isFilled(current: any, stored: any): boolean {
    if (stored.length <= 0) {
      return false
    }
    return dateCompare(stored[0], current)
  }

  async fill(answers?: any): Promise<void> {
    answers = answers || (await this.answer())
    if (answers.length > 0) {
      await fieldFillerQueue.enqueue(async () => {
        const [month, year] = answers[0].answer
        await fillDatePart(this.monthInputElement, month)
        await fillDatePart(this.yearInputElement, year)
      })
    }
  }
}

export class MonthDayYear extends WorkdayBaseInput<[string, string]> {
  static XPATH = xpaths.MONTH_DAY_YEAR
  fieldType = 'MonthDayYear'
  public saveButtonClickHandler = saveButtonClickHandlers.withNotice
  fieldNotice: string = "Choose a relative or absolute date."
  fieldNoticeLink = {
    display: "See How",
    url: "https://www.youtube.com/watch?v=JYMATq9siIY&t=207s"
  }
  get answerValue() {
    return {
      ...super.answerValue,
      init: answerValueInitRelativeDate,
      prepForSave: (
        answerValue: EditableAnswerValueRelativeDate
      ): AnswerValueRelativeDate => {
        const { relative, relativeValue, absoluteValue } = answerValue
        return {
          relative,
          value: relative ? relativeValue : absoluteValue,
        } as AnswerValueRelativeDate
      },
      displayComponent: AnswerValueSingleRelativeDate,
    } as AnswerValueMethods
  }
  listenForChanges(): void {
    setupChangeListener(this)
  }

  get monthInputElement(): HTMLInputElement {
    return getElement(
      this.element,
      ".//input[@aria-label='Month']"
    ) as HTMLInputElement
  }

  get dayInputElement(): HTMLInputElement {
    return getElement(
      this.element,
      ".//input[@aria-label='Day']"
    ) as HTMLInputElement
  }

  get yearInputElement(): HTMLInputElement {
    return getElement(
      this.element,
      ".//input[@aria-label='Year']"
    ) as HTMLInputElement
  }

  currentValue() {
    return [
      this.monthInputElement.value,
      this.dayInputElement.value,
      this.yearInputElement.value,
    ]
  }

  public get fieldSnapshot(): Answer {
    return {
      path: this.path,
      answer: { value: this.currentValue(), relative: false },
    }
  }

  get wrapperElement(): HTMLElement {
    return getElement(
      this.element,
      ".//div[@data-automation-id='dateInputWrapper']"
    )
  }

  /**
   * Compare only the first stored date.
   */
  isFilled(
    current: AbsoluteDateValue,
    stored: AnswerValueRelativeDate[]
  ): boolean {
    if (stored.length <= 0) {
      return false
    }
    const absDate = convertRelativeDate(stored[0])
    return dateCompare(absDate, current)
  }

  async fill(answers?: any): Promise<void> {
    answers = answers || (await this.answer())
    if (answers.length > 0) {
      await fieldFillerQueue.enqueue(async () => {
        const [month, day, year] = convertRelativeDate(answers[0].answer)
        await fillDatePart(this.monthInputElement, month)
        await fillDatePart(this.dayInputElement, day)
        await fillDatePart(this.yearInputElement, year)
      })
    }
  }
}

export class Year extends WorkdayBaseInput<string> {
  static XPATH = xpaths.YEAR
  fieldType = 'Year'
  listenForChanges(): void {
    setupChangeListener(this)
  }

  get yearInputElement(): HTMLInputElement {
    return getElement(
      this.element,
      ".//input[@aria-label='Year']"
    ) as HTMLInputElement
  }
  currentValue() {
    return this.yearInputElement.value
  }

  get wrapperElement(): HTMLElement {
    return getElement(
      this.element,
      ".//div[@data-automation-id='dateInputWrapper']"
    )
  }

  public isFilled(current: any, stored: any[]): boolean {
    return stored[0] === current
  }

  async fill(): Promise<void> {
    const answers = await this.answer()
    const isFilled = this.isFilled(
      this.currentValue(),
      answers.map((a) => a.answer)
    )
    if (answers.length > 0 && !isFilled) {
      await fieldFillerQueue.enqueue(async () => {
        const year = answers[0]?.answer
        await fillDatePart(this.yearInputElement, year)
      })
    }
  }
}
