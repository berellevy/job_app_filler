import fieldFillerQueue from '@src/shared/utils/fieldFillerQueue'
import { getElement, waitForElement } from '@src/shared/utils/getElements'
import { WorkdayBaseInput } from './WorkdayBaseInput'
import { xpaths } from './xpaths'
import { AnswerValueSingleBool } from '../../../MoreInfoPopup/AnswerDisplay/AnswerValueDisplay/AnswerValueSingleBool'
import { AnswerValueMethods } from '../baseFormInput'

export class BooleanCheckbox extends WorkdayBaseInput<boolean> {
  static XPATH = xpaths.SINGLE_CHECKBOX
  fieldType: string = 'SingleCheckbox'
  public answerValueDisplayComponent = AnswerValueSingleBool
  public get answerValue() {
    return {
      ...super.answerValue,
      displayComponent: AnswerValueSingleBool
    } as AnswerValueMethods
  }

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

  public isFilled(current: any, stored: any[]): boolean {
    return current===stored[0]
  }

  /**
   * the checked value of the input element takes some time to change
   * after it's clicked. Therefore we have to wait for the value to update
   * before ending the function and allowing the react app to update.
   */
  async fill(): Promise<void> {
    await fieldFillerQueue.enqueue(async () => {
      const answer = await this.answer()
      const isFilled = this.isFilled(this.currentValue(), answer.map(a=> a.answer))
        if (answer.length > 0 && !isFilled) {
          const initialValue = this.currentValue()
          this.checkboxElement().click()
          await waitForElement(
            this.element,
            this.currentStateXpath(!initialValue)
          )
        }
      })
  }
}
