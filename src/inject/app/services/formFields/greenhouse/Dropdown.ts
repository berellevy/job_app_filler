import { AnswerValueBackupStrings } from '../../../MoreInfoPopup/AnswerDisplay/AnswerValueDisplay/AnswerValueBackupStrings'
import fieldFillerQueue from '@src/shared/utils/fieldFillerQueue'
import { getElement } from '@src/shared/utils/getElements'
import { GreenhouseBaseInput } from './GreenhouseBaseInput'
import { xpaths } from './xpaths'
import { answerValueInitList } from '../../../hooks/answerValueInit'
import { EditableAnswer } from '../../../hooks/useEditableAnswerState'

export class Dropdown extends GreenhouseBaseInput<any> {
  static XPATH = xpaths.SIMPLE_DROPDOWN
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
    return getElement(this.element, './/select') as HTMLInputElement
  }

  get select2ContainerElement(): HTMLElement {
    return getElement(
      this.element,
      ".//div[contains(@class, 'select2-container')]"
    )
  }
  get select2ContainerAElement(): HTMLElement {
    return getElement(this.select2ContainerElement, './/a')
  }

  toggleDropdown(): void {
    this.select2ContainerAElement?.dispatchEvent(new MouseEvent('mousedown'))
  }
  openDropdown(): void {
    if (!this.dropdownIsOpen) {
      this.toggleDropdown()
    }
  }

  closeDropdown(): void {
    if (this.dropdownIsOpen) {
      this.toggleDropdown()
    }
  }

  get dropdownIsOpen(): boolean {
    return this.select2ContainerElement.classList.contains(
      'select2-dropdown-open'
    )
  }

  get dropdownId(): string {
    return getElement(this.select2ContainerElement, "./label")?.getAttribute("for")
  }

  get dropdownElement(): HTMLElement {
    const XPATH = [
      ".//div[contains(@class, 'select2-drop-active')]",
      `[.//label[@for='${this.dropdownId}_search']]`
    ].join("")
    return getElement(
      document,
      XPATH
    )
  }

  inputDisplayElement(): HTMLElement {
    return this.select2ContainerElement
  }
  listenForChanges(): void {
    const observer = new MutationObserver((mutationsList) => {
      this.triggerReactUpdate()
    })

    observer.observe(this.select2ContainerElement, {
      childList: true,
      subtree: true,
    })
  }
  currentValue() {
    return this.select2ContainerAElement?.innerText
  }
  async fill(): Promise<void> {
    const answers = await this.answer()
    await fieldFillerQueue.enqueue(async () => {
      if (answers.length > 0) {
        for (const answer of answers) {
          this.openDropdown()
          if (this.dropdownIsOpen) {
            const correctAnswerXpath  = [
              `.//div[contains(text(), "${answer.answer}")]/parent::li`
            ].join("")
            const correctAnswerElement = getElement(
              this.dropdownElement,
              correctAnswerXpath
            )
            if (correctAnswerElement) {
              correctAnswerElement.dispatchEvent(new Event("mouseup", {
                bubbles: true,
                cancelable: true,
              }))
              break
            }
          }
        }
        this.closeDropdown()
      }
    })
  }
}
