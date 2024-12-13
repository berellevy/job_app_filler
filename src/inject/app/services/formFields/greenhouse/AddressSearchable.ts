import { sleep } from '@src/shared/utils/async'
import fieldFillerQueue from '@src/shared/utils/fieldFillerQueue'
import { getElement, waitForElement } from '@src/shared/utils/getElements'
import { GreenhouseBaseInput } from './GreenhouseBaseInput'
import { xpaths } from './xpaths'
import AnswerDTO from '../../DTOs/AnswerDTO'


export class AddressSearchable extends GreenhouseBaseInput {
  static XPATH = xpaths.ADDRESS_SEARCH_FIELD
  fieldType = 'Dropdown'

  inputElement(): HTMLInputElement {
    return getElement(
      this.element,
      ".//input[@type='text']"
    ) as HTMLInputElement
  }

  listenForChanges(): void {
    const observer = new MutationObserver((mutationsList) => {
      this.triggerReactUpdate()
    })
    // Set the observer to watch for attribute changes
    observer.observe(this.autoCompleteElement, {
      attributes: true,
      attributeFilter: ['value'],
    })
  }

  get autoCompleteElement(): HTMLElement {
    return getElement(this.element, './/auto-complete')
  }

  currentValue() {
    return this.autoCompleteElement.getAttribute('value') || ''
  }

  async fill(answers: AnswerDTO<string>[]): Promise<void> {
    if (!this.inputElement) {
      return
    }
    await fieldFillerQueue.enqueue(async () => {
      for (const answer of answers) {
        this.inputElement().value = answer.answer
        await sleep(100)
        this.inputElement().dispatchEvent(new InputEvent('input'))
        await waitForElement(this.element, './/auto-complete[@open]', {
          timeout: 1500,
        })
        const correctAnswerXpath = [
          './/ul/li',
          `[text() = '${answer.answer}']`,
        ].join('')
        const correctAnswerElement = getElement(
          this.element,
          correctAnswerXpath
        )
        correctAnswerElement && correctAnswerElement.click()
        if (this.currentValue() === answer.answer) {
          return
        }
      }
    })
  }
}
