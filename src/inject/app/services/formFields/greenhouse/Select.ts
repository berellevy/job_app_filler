import { AnswerValueBackupStrings } from '../../../MoreInfoPopup/AnswerDisplay/AnswerValueDisplay/AnswerValueBackupStrings'
import fieldFillerQueue from '@src/shared/utils/fieldFillerQueue'
import { getElement } from '@src/shared/utils/getElements'
import { GreenhouseBaseInput } from './GreenhouseBaseInput'
import { xpaths } from './xpaths'
import { answerValueInitList } from '../../../hooks/answerValueInit'
import { EditableAnswer } from '../../../hooks/useEditableAnswerState'

export class Select extends GreenhouseBaseInput<any> {
  static XPATH: string = xpaths.BASIC_SELECT
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


  get selectElement(): HTMLSelectElement {
    return getElement(this.element, './/select') as HTMLSelectElement
  }

  inputElement(): HTMLInputElement {
    return this.selectElement as unknown as HTMLInputElement
  }
  listenForChanges(): void {
    this.selectElement.addEventListener("change", () => {
      this.triggerReactUpdate()
    })
  }
  get selectedAnswerElement(): HTMLOptionElement {
    return this.selectElement.selectedOptions[0]
  }
  currentValue(): string {
    return this.selectElement.selectedOptions[0]?.innerText || ''
  }
  async fill(): Promise<void> {
    const answers = await this.answer()
    await fieldFillerQueue.enqueue(async () => {
      for (const answer of answers) {
        const correctAnswerElement = getElement(
          this.selectElement,
          `./option[text() = "${answer.answer}"]`
        ) as HTMLOptionElement
        if (correctAnswerElement) {
          this.selectElement.selectedIndex = correctAnswerElement.index
          break
        }
      }
    })
  }
}
