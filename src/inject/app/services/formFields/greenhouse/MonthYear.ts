import { AnswerValueSingleDate } from '../../../MoreInfoPopup/AnswerDisplay/AnswerValueDisplay/AnswerValueSingleDate'
import fieldFillerQueue from '@src/shared/utils/fieldFillerQueue'
import { getElement } from '@src/shared/utils/getElements'
import { dateCompare } from '../utils/dateUtils'
import { GreenhouseBaseInput } from './GreenhouseBaseInput'
import { xpaths } from './xpaths'

export class MonthYear extends GreenhouseBaseInput<any> {
  static XPATH = xpaths.MONTH_YEAR
  fieldType = 'MonthYear'
  public answerValueDisplayComponent = AnswerValueSingleDate
  get answerValue() {
    return {
      ...super.answerValue,
      displayComponent: AnswerValueSingleDate,
    }
  }

  get inputWrapper(): HTMLElement {
    return getElement(this.element, `./fieldset`)
  }

  listenForChanges(): void {
    this.inputWrapper.addEventListener('input', (e) => {
      this.triggerReactUpdate()
    })
  }

  inputElement(): HTMLInputElement {
    return getElement(this.element, `.//input`) as HTMLInputElement
  }

  get monthInputElement(): HTMLInputElement {
    return getElement(
      this.element,
      `.//input[@placeholder="MM"]`
    ) as HTMLInputElement
  }

  get yearInputElement(): HTMLInputElement {
    return getElement(
      this.element,
      `.//input[@placeholder="YYYY"]`
    ) as HTMLInputElement
  }

  currentValue() {
    return [this.monthInputElement.value, this.yearInputElement.value]
  }

  isFilled(current: any, stored: any): boolean {
    if (stored.length <= 0) {
      return false
    }
    return dateCompare(stored[0], current)
  }

  async fill(): Promise<void> {
    const answers = await this.answer()
    if (answers.length > 0) {
      await fieldFillerQueue.enqueue(async () => {
        const [month, year] = answers[0].answer
        this.monthInputElement.value = month
        this.monthInputElement.dispatchEvent(new InputEvent('input'))
        this.yearInputElement.value = year
        this.yearInputElement.dispatchEvent(new InputEvent('input'))
      })
    }
  }
}
