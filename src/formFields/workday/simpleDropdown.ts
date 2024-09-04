import { FC } from 'react'
import { answerValueInitList } from '../../hooks/answerValueInit'
import {
  SaveButtonClickHndler,
  saveButtonClickHandlers,
} from '../../hooks/saveButtonClickHandlers'
import { sleep } from '../../utils/async'
import fieldFillerQueue from '../../utils/fieldFillerQueue'
import { getElement, waitForElement } from '../../utils/getElements'
import { scrollBack } from '../../utils/scroll'
import { Answer } from '../../utils/types'
import { getReactProps } from '../baseFormInput'
import { WorkdayBaseInput } from './workdayBaseInput'
import { AnswerValueBackupStrings } from '../../components/AnswerValueDisplayComponents/AnswerValueBackupStrings'

import * as xpaths from './xpaths'
import * as stringMatch from '../../utils/stringMatch'
import { EditableAnswer } from '../../hooks/useEditableAnswerState'
import { lowerText } from '../../utils/xpath'

export class SimpleDropdown extends WorkdayBaseInput<string[] | null> {
  static XPATH: string = xpaths.SIMPLE_DROPDOWN
  fieldType: string = 'SimpleDropdown'
  public saveButtonClickHandler = saveButtonClickHandlers.backupAnswerList
  public answerValueInit = answerValueInitList
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
  currentValue(): string | null {
    return this.buttonElement.innerText
  }

  private get buttonElement(): HTMLElement {
    return getElement(this.element, './/button[@data-automation-id]')
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

  isFilled(current: string, stored: string[]): boolean {
    for (const answer of stored) {
      if (stringMatch.contains(current, answer)) {
        return true
      }
    }
    return false
  }

  answerElementXpath(answer: string): string {
    const XPATH = `.//div[contains(${lowerText()}, '${answer.toLowerCase()}')]/parent::li`
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
    const answers = await this.answer()
    await fieldFillerQueue.enqueue(async () => {
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
