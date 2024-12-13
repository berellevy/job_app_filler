import { sleep } from '@src/shared/utils/async'
import fieldFillerQueue from '@src/shared/utils/fieldFillerQueue'
import {
  getElement,
  waitForElement,
} from '@src/shared/utils/getElements'
import { scrollBack } from '@src/shared/utils/scroll'
import { addCharacterMutationObserver, getReactProps } from '../utils'
import { WorkdayBaseInput } from './WorkdayBaseInput'

import stringMatch from '@src/shared/utils/stringMatch'
import { lowerText } from '@src/shared/utils/xpath'
import { xpaths } from './xpaths'
import AnswerDTO from '../../DTOs/AnswerDTO'

export class Dropdown extends WorkdayBaseInput {
  static XPATH: string = xpaths.SIMPLE_DROPDOWN
  fieldType = 'Dropdown'

  private get buttonElement(): HTMLElement {
    return getElement(this.element, './/button[@aria-haspopup="listbox"]')
  }
  /** fires whenever the buttonElement's innerText changes */
  listenForChanges(): void {
    addCharacterMutationObserver(this.buttonElement, () => {
      this.triggerReactUpdate()
    })
  }

  currentValue(): string | null {
    return this.buttonElement.innerText
  }

  openDropdown() {
    if (!this.dropdownIsOpen) {
      this.buttonElement.click()
    }
  }

  closeDropdown() {
    if (this.dropdownIsOpen) {
      this.buttonElement.click()
      this.buttonElement.click()
    }
  }

  private get dropdownIsOpen(): boolean {
    return this.buttonElement.hasAttribute('aria-expanded')
  }

  get dropdownId(): string {
    return this.buttonElement.getAttribute('aria-controls')
  }

  async dropdownElement(): Promise<HTMLElement | undefined | null> {
    if (this.dropdownIsOpen) {
      const XPATH = ['.//body', `//ul[@id='${this.dropdownId}']`].join('')
      return await waitForElement(document, XPATH)
    }
  }

  public clickIsInFormfield(e: PointerEvent): boolean {
    const target = e.target as HTMLElement
    return (
      super.clickIsInFormfield(e) ||
      Boolean(target.closest(`ul#${this.dropdownId}`))
    )
  }

  isFilled(current: string, stored: string[]): boolean {
    for (const answer of stored) {
      if (stringMatch.contains(current, answer)) {
        return true
      }
    }
    return false
  }

  answerElementXpath(answer: string): string {
    const XPATH = `.//div[${lowerText()}="${answer.toLowerCase()}"]/parent::li`
    return XPATH
  }

  /**
   * ### Storage Format
   * Since dropdowns don't always have the same choices, the user can save backup answers.
   * Therefore, the code cycles through the stored answers, trying each one. The first
   * match that found is selected.
   * For now the ui only supports one answer.
   *
   */
  async fill(answers: AnswerDTO<string>[]): Promise<void> {
    await fieldFillerQueue.enqueue(async () => {
      await scrollBack(async () => {
        for (const answer of answers) {
          const answerValue = answer.answer
          this.openDropdown()
          await sleep(50)
          const dropdownElement = await this.dropdownElement()
          if (dropdownElement) {
            const XPATH = this.answerElementXpath(answerValue)
            const answerElement = getElement(dropdownElement, XPATH)
            if (answerElement) {
              getReactProps(answerElement).onClick({
                preventDefault: () => {},
              })
              break
            }
          }
        }
        this.closeDropdown()
      })
    })
  }
}
