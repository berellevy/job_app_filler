import { sleep } from '../../utils/async'
import fieldFillerQueue from '../../utils/fieldFillerQueue'
import { getElement, waitForElement } from '../../utils/getElements'
import { scrollBack } from '../../utils/scroll'
import { Answer, AnswerDisplayType } from '../../utils/types'
import { getReactProps } from '../baseFormInput'
import { WorkdayBaseInput } from './workdayBaseInput'

import * as xpaths from './xpaths'

export class SimpleDropdown extends WorkdayBaseInput<string[] | null> {
  static XPATH: string = xpaths.SIMPLE_DROPDOWN
  fieldType: string = 'SimpleDropdown'
  answerDisplayType: AnswerDisplayType = "BackupAnswerDisplay"

  /**
   * fires whenever the buttonElement's innerText changes
   */
  listenForChanges(): void {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'characterData') {
          this.triggerReactUpdate()
        }
      }
    })
    observer.observe(this.buttonElement, {
      characterData: true,
      childList: true,
      subtree: true,
    })
  }
  currentValue(): string[] | null {
    return [this.buttonElement.innerText]
  }

  async isFilled(answer?: Answer): Promise<boolean> {
    answer = answer || (await this.answer())
    return (answer.answer || []).includes(this.currentValue()[0])
  }

  private get buttonElement(): HTMLElement {
    return getElement(this.element, './/button[@data-automation-id]')
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

  async dropdownElement(): Promise<HTMLElement | undefined | null> {
    if (this.dropdownIsOpen) {
      const dropdownId = this.buttonElement.getAttribute('aria-controls')
      const XPATH = [
        './/body',
        "/div[@data-automation-widget='wd-popup']",
        `//ul[@id='${dropdownId}']`,
      ].join('')
      return await waitForElement(document, XPATH)
    }
  }

  /**
   * ### Storage Format
   * Since dropdowns don't always have the same choices, the user can save backup answers.
   * Therefore, the code cycles through the stored answers, trying each one. The first
   * match that found is selected.
   * For now the ui only supports one answer.
   *
   */
  async fill(): Promise<void> {
    const { answer, hasAnswer } = await this.answer()
    if (hasAnswer && (answer || []).length > 0)
      await fieldFillerQueue.enqueue(async () => {
        await scrollBack(async () => {
          const answerList = answer
          this.openDropdown()
          await sleep(50)
          const dropdownElement = await this.dropdownElement()
          if (dropdownElement) {
            while (answerList.length > 0) {
              const answer = answerList.shift()
              const XPATH = `.//div[contains(text(), '${answer}')]/parent::li`
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
