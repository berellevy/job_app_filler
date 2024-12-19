import { AnswerValueBackupStrings } from '../../../MoreInfoPopup/AnswerDisplay/AnswerValueDisplay/AnswerValueBackupStrings'
import fieldFillerQueue from '@src/shared/utils/fieldFillerQueue'
import { getElement, getElements } from '@src/shared/utils/getElements'
import { GreenhouseBaseInput } from './GreenhouseBaseInput'
import { xpaths } from './xpaths'
import { answerValueInitList } from '../../../hooks/answerValueInit'
import { EditableAnswer } from '../../../hooks/useEditableAnswerState'
import AnswerDTO from '../../DTOs/AnswerDTO'

/**
 * Note: "Two or More Races opens a text box, add support eventually"
 */
export class Checkboxes extends GreenhouseBaseInput {
  static XPATH = xpaths.MULTI_CHECKBOX
  fieldType = 'Dropdown'

  inputElement(): HTMLInputElement {
    return this.element as HTMLInputElement
  }

  /**
   * Some fields, mostly the dei fields, have the question as text 
   * directly in the div.field.
   * others have the question in a label field.
   */
  get firstTextNodeContent(): string {
    const { firstChild } = this.element
    if (firstChild.nodeType === Node.TEXT_NODE) {
      return firstChild.textContent.trim()
    }
  }

  public get fieldName(): string {
    return this.firstTextNodeContent || super.fieldName
  }

  inputDisplayElement(): HTMLElement {
    return getElement(this.element, ".//input[@type='hidden']")
  }
  listenForChanges(): void {
    this.element.addEventListener('click', (e) => {
      if ((e.target as HTMLElement).nodeName === 'INPUT') {
        this.triggerReactUpdate()
      }
    })
  }

  get checkboxLabelElements(): HTMLElement[] {
    return getElements(this.element, ".//label[.//input[@type='checkbox']]")
  }

  get selectedElement(): HTMLElement {
    return this.checkboxLabelElements.find((labelEl) => {
      return (labelEl.firstElementChild as HTMLInputElement).checked
    })
  }
  currentValue() {
    return this.selectedElement?.innerText || ''
  }

  async fill(answers: AnswerDTO<string>[]): Promise<void> {
    await fieldFillerQueue.enqueue(async () => {
      for (const answer of answers) {
        const correctAnswerElement = getElements(
          this.element,
          `.//label`
        ).find((el) => el.innerText.trim() === answer.answer.trim())
        if (correctAnswerElement) {
          correctAnswerElement.click()
          break
        }
      }
    })
  }
}
