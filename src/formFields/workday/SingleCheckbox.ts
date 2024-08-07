import fieldFillerQueue from '../../utils/fieldFillerQueue'
import { getElement, waitForElement } from '../../utils/getElements'
import { AnswerDisplayType } from '../../utils/types'
import { WorkdayBaseInput } from './workdayBaseInput'
import * as xpaths from './xpaths'

export class SingleCheckbox extends WorkdayBaseInput<boolean> {
  static XPATH = xpaths.SINGLE_CHECKBOX
  fieldType: string = 'SingleCheckbox'
  answerDisplayType: AnswerDisplayType = "SingleAnswerDisplay"

  /**
   * When the change event is intercepted, the value is still the old value.
   * Therefore, we have to wait for the correct value to appear before updating 
   * the react app.
   */
  listenForChanges(): void {
    this.checkboxElement().addEventListener('change', (e) => {
      waitForElement(
        this.element,
        this.currentStateXpath(!e.target['checked'])
      ).then(() => {
        this.triggerReactUpdate()
      })
    })
  }

  currentStateXpath(expectedValue: boolean): string {
    return [
      './/input',
      "[@type='checkbox']",
      `[@aria-checked='${expectedValue}']`,
    ].join('')
  }

  checkboxElement(): HTMLInputElement {
    return getElement(
      this.element,
      ".//input[@type='checkbox']"
    ) as HTMLInputElement
  }

  currentValue() {
    return this.checkboxElement().checked
  }

  /**
   * the checked value of the input element takes some time to change
   * after it's clicked. Therefore we have to wait for the value to update
   * before ending the function and allowing the react app to update.
   */
  async fill(): Promise<void> {
    const answer = await this.answer()
    if (answer.hasAnswer && !(await this.isFilled(answer))) {
      await fieldFillerQueue.enqueue(async () => {
        const initialValue = this.currentValue()
        this.checkboxElement().click()
        await waitForElement(
          this.element,
          this.currentStateXpath(!initialValue)
        )
      })
    }
  }
}
