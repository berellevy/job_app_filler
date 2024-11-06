import { sleep } from '../../utils/async'
import fieldFillerQueue from '../../utils/fieldFillerQueue'
import { getElement, waitForElement } from '../../utils/getElements'
import { GreenhouseBaseInput } from './GreenhouseBaseInput'
import * as xpaths from './xpaths'

export class AddressSearchField extends GreenhouseBaseInput<any> {
  static XPATH = xpaths.ADDRESS_SEARCH_FIELD
  fieldType = 'SimpleDropdown'

  inputElement(): HTMLInputElement {
    return getElement(
      this.element,
      ".//input[@type='text']"
    ) as HTMLInputElement
  }
  listenForChanges(): void {
    const observer = new MutationObserver((mutationsList) => {
      this.triggerReactUpdate()
  });
  
  // Set the observer to watch for attribute changes
  observer.observe(this.autoCompleteElement, { attributes: true, attributeFilter: ['value'] });
  }

  get autoCompleteElement(): HTMLElement {
    return getElement(this.element, ".//auto-complete")
  }
  currentValue() {
    return this.autoCompleteElement.getAttribute("value") || ""
  }
  async fill(): Promise<void> {
    const answers = await this.answer()
    await fieldFillerQueue.enqueue(async () => {
      if (this.inputElement && answers.length > 0) {
        for (const answer of answers) {
          this.inputElement().value = answer.answer
          await sleep(100)
          this.inputElement().dispatchEvent(new InputEvent("input"))
          await waitForElement(this.element, './/auto-complete[@open]', {
            timeout: 1500,
          })
          const correctAnswerXpath  = [
            ".//ul/li",
            `[text() = '${answer.answer}']`
          ].join("")
          const correctAnswerElement = getElement(this.element, correctAnswerXpath)
          correctAnswerElement && correctAnswerElement.click()
          if (this.currentValue() === answer.answer) {
            return
          }
        }
      }
    })
  }
}
