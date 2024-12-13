import fieldFillerQueue from '@src/shared/utils/fieldFillerQueue'
import { getElement } from '@src/shared/utils/getElements'
import { WorkdayBaseInput } from '../WorkdayBaseInput'
import { setupChangeListener, fillDatePart } from './utils'
import { xpaths } from '../xpaths'
import AnswerDTO from '../../../DTOs/AnswerDTO'

export class Year extends WorkdayBaseInput {
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

  async fill(answers: AnswerDTO<string>[]): Promise<void> {
    await fieldFillerQueue.enqueue(async () => {
      const year = answers[0]?.answer
      await fillDatePart(this.yearInputElement, year)
    })
  }
}
