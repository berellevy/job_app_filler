import { sleep } from '../../utils/async'
import fieldFillerQueue from '../../utils/fieldFillerQueue'
import {
  getElement,
  getElements,
  waitForElement,
} from '../../utils/getElements'
import { getReactProps } from '../baseFormInput'
import { WorkdayBaseInput } from './workdayBaseInput'
import * as xpaths from './xpaths'

export class BooleanRadio extends WorkdayBaseInput<string> {
  static XPATH = xpaths.BOOLEAN_RADIO
  fieldType = 'BooleanRadio'
  listenForChanges(): void {
    const radioGroupElement = getElement(
      this.element,
      ".//div[@data-uxi-widget-type='radioGroup']"
    )
    radioGroupElement.addEventListener('change', () => {
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
    return getElement(this.element, XPATH)
  }

  currentValue() {
    return this.checkedRadioElement.textContent
  }

  async fill(): Promise<void> {
    await fieldFillerQueue.enqueue(async () => {
      const answer = await this.answer()
      const XPATH = [
        '//div',
        `[label[text()='${answer}']]`,
        "//input[@type='radio']",
      ].join('')
      const checkElement = getElement(this.element, XPATH)
      checkElement.click()
    })
  }
}
