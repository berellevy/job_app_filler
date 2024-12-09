import fieldFillerQueue from '@src/shared/utils/fieldFillerQueue'
import { getElement } from '@src/shared/utils/getElements'
import { WorkdayBaseInput } from '../WorkdayBaseInput'
import { xpaths } from '../xpaths'
import { AnswerValueSingleDate } from '../../../../MoreInfoPopup/AnswerDisplay/AnswerValueDisplay/AnswerValueSingleDate'
import { setupChangeListener, fillDatePart } from './utils'
import { dateCompare } from '../../utils/dateUtils'

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
    await fieldFillerQueue.enqueue(async () => {
      answers = answers || (await this.answer())
      if (answers.length > 0) {
        const [month, year] = answers[0].answer
        await fillDatePart(this.monthInputElement, month)
        await fillDatePart(this.yearInputElement, year)
      }
    })
  }
}
