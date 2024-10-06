import { AnswerValueBackupStrings } from '../../components/AnswerValueDisplayComponents/AnswerValueBackupStrings'
import { answerValueInitList } from '../../hooks/answerValueInit'
import {
  saveButtonClickHandlers,
  SaveButtonClickHndler,
} from '../../hooks/saveButtonClickHandlers'
import { EditableAnswer } from '../../hooks/useEditableAnswerState'
import fieldFillerQueue from '../../utils/fieldFillerQueue'
import { getElement, waitForElement } from '../../utils/getElements'
import { Answer } from '../../utils/types'
import { WorkdayBaseInput } from './workdayBaseInput'
import * as xpaths from './xpaths'
import * as stringMatch from '../../utils/stringMatch'
import { scrollBack } from '../../utils/scroll'
import { lowerText } from '../../utils/xpath'

export class MultiCheckbox extends WorkdayBaseInput<any> {
  static XPATH: string = xpaths.MULTI_CHECKBOX
  fieldType: string = 'MultiCheckbox'
  // public saveButtonClickHandler = saveButtonClickHandlers.backupAnswerList
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

  public get fieldName(): string {
    if (
      this.element.getAttribute('data-automation-id')?.endsWith('-disability')
    ) {
      return 'disability'
    }

    return super.fieldName
  }

  listenForChanges(): void {
    this.element.addEventListener('change', (e) => {
      this.triggerReactUpdate()
    })
  }

  get selectedCheckBoxElement(): HTMLElement {
    const XPATH = [
      ".//div[@role='cell']",
      '[',
      ".//input[@type='checkbox'][@aria-checked='true']",
      ']',
    ].join('')
    return getElement(this.element, XPATH)
  }
  currentValue() {
    return this.selectedCheckBoxElement?.innerText || ''
  }

  public isFilled(current: any, stored: any[]): boolean {
    return stored.some((answer) => stringMatch.contains(current, answer))
  }

  getCheckboxElement(answer: string): HTMLInputElement {
    const XPATH = [
      ".//div[@role='cell']",
      `[.//label[normalize-space(text())='${answer}']]`,
      "//input[@type='checkbox']",
    ].join('')
    return getElement(this.element, XPATH) as HTMLInputElement
  }

  public get fieldSnapshot(): Answer {
    return {
      path: this.path,
      answer: [this.currentValue()],
    }
  }

  async fill(): Promise<void> {
    await fieldFillerQueue.enqueue(async () => {
      await scrollBack(async () => {
        if (this.selectedCheckBoxElement) {
          getElement(
            this.selectedCheckBoxElement,
            ".//input[@type='checkbox']"
          ).click()
        }
        const answers = (await this.answer()) || []
        const answerValues = answers
          .map((answer: Answer) => answer.answer)
          .flat()
        const answerList = structuredClone(answerValues)
        while (answerList.length > 0) {
          const answer = answerList.shift()
          const checkboxElement = this.getCheckboxElement(answer)
          if (checkboxElement && !checkboxElement.checked) {
            checkboxElement.click()
            break
          }
        }
      })
    })
  }

}
