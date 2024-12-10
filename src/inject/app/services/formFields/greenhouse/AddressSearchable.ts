import { AnswerValueBackupStrings } from '../../../MoreInfoPopup/AnswerDisplay/AnswerValueDisplay/AnswerValueBackupStrings'
import { sleep } from '@src/shared/utils/async'
import fieldFillerQueue from '@src/shared/utils/fieldFillerQueue'
import { getElement, waitForElement } from '@src/shared/utils/getElements'
import { GreenhouseBaseInput } from './GreenhouseBaseInput'
import { xpaths } from './xpaths'
import { answerValueInitList } from '../../../hooks/answerValueInit'
import { EditableAnswer } from '../../../hooks/useEditableAnswerState'


export class AddressSearchable extends GreenhouseBaseInput<any> {
  static XPATH = xpaths.ADDRESS_SEARCH_FIELD
  fieldType = 'SimpleDropdown'
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

  public get fieldSnapshot() {
    return {
      path: this.path,
      answer: [this.currentValue()],
    }
  }

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

  async fill(): Promise<void> {
    const answers = await this.answer()
    await fieldFillerQueue.enqueue(async () => {
      if (this.inputElement && answers.length > 0) {
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
          if (this.currentValue() === answer.answer[0]) {
            return
          }
        }
      }
    })
  }
}
