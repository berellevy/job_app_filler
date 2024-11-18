import { saveButtonClickHandlers } from '../../hooks/saveButtonClickHandlers'
import fieldFillerQueue from '../../utils/fieldFillerQueue'
import { getElement } from '../../utils/getElements'
import { WorkdayBaseInput } from './workdayBaseInput'
import * as xpaths from './xpaths'
import * as stringMatch from "../../utils/stringMatch"
import { lowerText } from '../../utils/xpath'

export class BooleanRadio extends WorkdayBaseInput<string> {
  static XPATH = xpaths.BOOLEAN_RADIO
  fieldType = 'BooleanRadio'


  listenForChanges(): void {
    const radioGroupElement = getElement(this.element, './/fieldset')
    radioGroupElement.addEventListener('change', (e) => {
      this.triggerReactUpdate()
    })
  }

  get fieldName(): string {
    const fieldNames = ['previousWorker']
    for (const name in fieldNames) {
      if (
        getElement(
          this.element,
          `.//div[@data-automation-id='${fieldNames[name]}']`
        )
      ) {
        return fieldNames[name]
      }
    }
    return getElement(this.element, './/legend').innerText
  }

  get checkedRadioElement(): HTMLElement {

    const XPATH = [
      ".//input[@type='radio'][@aria-checked='true']",
      '/ancestor::div',
      '[label]',
    ].join('')
    const el = getElement(this.element, XPATH)
    return el
  }

  /**
   * exact match (case insensetive)
   */
  public isFilled(current: any, stored: any[]): boolean {
    return stored.some(answer => stringMatch.exact(current, answer));
  }

  currentValue() {
    return this.checkedRadioElement?.textContent
  }

  async fill(): Promise<void> {
    const answer = await this.answer()
    if (answer.length > 0) {
      await fieldFillerQueue.enqueue(async () => {
        const XPATH = [
          '//div',
          `[label[${lowerText()}='${answer[0].answer.toLowerCase()}']]`,
          "//input[@type='radio']",
        ].join('')
        const checkElement = getElement(this.element, XPATH)
        checkElement?.click()
      })
    }
  }
  
}
