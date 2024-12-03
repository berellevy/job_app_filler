import fieldFillerQueue from '../../../utils/fieldFillerQueue'
import { getElement } from '../../../utils/getElements'
import { Answer } from '../../../utils/types'
import { AnswerValueMethods } from '../../baseFormInput'
import { WorkdayBaseInput } from '.././workdayBaseInput'
import { AnswerValueSingleRelativeDate } from '../../../components/AnswerValueDisplayComponents/AnswerValueSingleRelativeDate'
import {
  AbsoluteDateValue,
  answerValueInitRelativeDate,
  AnswerValueRelativeDate,
  EditableAnswerValueRelativeDate,
} from '../../../hooks/answerValueInit'
import { saveButtonClickHandlers } from '../../../hooks/saveButtonClickHandlers'
import {
  setupChangeListener,
  fillDatePart,
  convertRelativeDate,
} from './utils'
import { xpaths } from '../xpaths'
import { dateCompare } from '../../utils/dateUtils'

export class MonthDayYear extends WorkdayBaseInput<[string, string]> {
  static XPATH = xpaths.MONTH_DAY_YEAR
  fieldType = 'MonthDayYear'
  public saveButtonClickHandler = saveButtonClickHandlers.withNotice
  fieldNotice = `##### Choose a relative or absolute date. 
  [See how](https://www.youtube.com/watch?v=JYMATq9siIY&t=207s)`
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
