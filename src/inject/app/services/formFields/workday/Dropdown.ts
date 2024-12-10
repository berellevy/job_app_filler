import { sleep } from '@src/shared/utils/async'
import fieldFillerQueue from '@src/shared/utils/fieldFillerQueue'
import {
  getElement,
  waitForElement,
} from '@src/shared/utils/getElements'
import { scrollBack } from '@src/shared/utils/scroll'
import { Answer } from '@src/shared/utils/types'
import { addCharacterMutationObserver, getReactProps } from '../utils'
import { WorkdayBaseInput } from './WorkdayBaseInput'
import { AnswerValueBackupStrings } from '../../../MoreInfoPopup/AnswerDisplay/AnswerValueDisplay/AnswerValueBackupStrings'

import stringMatch from '@src/shared/utils/stringMatch'
import { lowerText } from '@src/shared/utils/xpath'
import { xpaths } from './xpaths'
import { answerValueInitList } from '../../../hooks/answerValueInit'
import { EditableAnswer } from '../../../hooks/useEditableAnswerState'

export class Dropdown extends WorkdayBaseInput<string[] | null> {
  static XPATH: string = xpaths.SIMPLE_DROPDOWN
  fieldType: string = 'SimpleDropdown'
  public get answerValue() {
    return {
      ...super.answerValue,
      displayComponent: AnswerValueBackupStrings,
      init: answerValueInitList,
      prepForSave: (values: [string, boolean][]) => {
        return values.map(([value, editable]) => value)
      },
      prepForFill: (answers: EditableAnswer[]): string[] => {
        return super.answerValue.prepForFill(answers).flat()
      },
    }
  }

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

  public get fieldSnapshot(): Answer {
    return {
      path: this.path,
      answer: [this.currentValue()],
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
  async fill(): Promise<void> {
    await fieldFillerQueue.enqueue(async () => {
      const answers = await this.answer()
      await scrollBack(async () => {
        for (const answer of answers) {
          const answerList = answer.answer
          this.openDropdown()
          await sleep(50)
          const dropdownElement = await this.dropdownElement()
          if (dropdownElement) {
            while (answerList.length > 0) {
              const answer = answerList.shift()
              const XPATH = this.answerElementXpath(answer)
              const answerElement = getElement(dropdownElement, XPATH)

              if (answerElement) {
                getReactProps(answerElement).onClick({
                  preventDefault: () => {},
                })
                this.closeDropdown()
                return
              }
            }
          }
        }
        this.closeDropdown()
      })
    })
  }
}
