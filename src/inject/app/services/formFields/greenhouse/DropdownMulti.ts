import { AnswerValueBackupStrings } from '../../../MoreInfoPopup/AnswerDisplay/AnswerValueDisplay/AnswerValueBackupStrings'
import { keydownEnter, keydownEscape } from '../../../../../shared/utils/events'
import fieldFillerQueue from '../../../../../shared/utils/fieldFillerQueue'
import {
  getElement,
  getElements,
} from '../../../../../shared/utils/getElements'
import { GreenhouseBaseInput } from './GreenhouseBaseInput'
import { xpaths } from './xpaths'
import { answerValueInitList } from '../../../hooks/answerValueInit'
import { EditableAnswer } from '../../../hooks/useEditableAnswerState'

export class DropdownMulti extends GreenhouseBaseInput<any> {
  static XPATH = xpaths.DROPDOWN_MULTI
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

  get elements(): ElementContainer {
    return new ElementContainer(this.element)
  }

  listenForChanges(): void {
    // the only thing that get added or removed is answer elements. no need to filter.
    const observer = new MutationObserver((mutations: MutationRecord[]) => {
      this.triggerReactUpdate()
    })

    observer.observe(this.elements.choiceList, {
      childList: true,
      subtree: true,
    })
  }

  inputElement(): HTMLInputElement {
    return this.elements.input
  }

  currentValue() {
    // return only first value for now to make it compatible with dropdown single
    return (
      this.elements.selectedOptions.map((element) => element.innerText)[0] || ''
    )
  }
  async fill(): Promise<void> {
    await fieldFillerQueue.enqueue(async () => {
      const answers = await this.answer()
      if (answers.length > 0) {
        const {dropdown} = this.elements
        dropdown.clearSelection()
        dropdown.open()
        for (const answer of answers) {
          const answerValue = answer.answer[0]
          
          dropdown.selectExact(answerValue)
          if (this.currentValue() === answerValue) {
            break
          }
        }
        dropdown.close()
      }
      
    })
  }
}

class ElementContainer {
  element: HTMLElement
  constructor(element: HTMLElement) {
    this.element = element
  }
  getElement(xpath: string): HTMLElement {
    return getElement(this.element, xpath)
  }

  get choiceList(): HTMLElement {
    return this.getElement(`.//ul[@class="select2-choices"]`)
  }

  get selectedOptions(): HTMLElement[] {
    return getElements(this.choiceList, `.//li[@class="select2-search-choice"]`)
  }

  get input(): HTMLInputElement {
    return this.select2Container as HTMLInputElement
  }

  get select2Container(): HTMLElement {
    return this.getElement('.//div[contains(@class, "select2-container")]')
  }

  get searchInput(): HTMLInputElement {
    return this.getElement(".//input[@type='text']") as HTMLInputElement
  }

  get dropdown(): DropdownContainer {
    return new DropdownContainer(this)
  }
}

/**
 * dropdown specific behavior and properties
 */
class DropdownContainer {
  elements: ElementContainer
  constructor(elements: ElementContainer) {
    this.elements = elements
  }

  clearSelection() {
    for (const el of this.elements.selectedOptions) {
      this.deleteSelectedItem(el)
    }
  }

  deleteSelectedItem(el: HTMLElement) {
    getElement(el, './a')?.click()
  }

  get isOpen(): boolean {
    return this.elements.select2Container.classList.contains(
      'select2-dropdown-open'
    )
  }

  close() {
    this.elements.searchInput.dispatchEvent(keydownEscape())
  }

  open() {
    !this.isOpen && this.elements.searchInput.click()
  }

  /**
   * searches `value` and hits enter.
   */
  selectInexact(value: string) {
    if (!this.isOpen) {
      return
    }
    this.elements.searchInput.value = value
    this.elements.searchInput.dispatchEvent(new InputEvent('input'))
    this.elements.searchInput.dispatchEvent(keydownEnter())
  }

  /**
   * search a value, select result and delete if it doesn't match exactly.
   */
  selectExact(value: string) {
    const observer = new MutationObserver((mutations: MutationRecord[]) => {
      const selectedElement = mutations[0].addedNodes[0] as HTMLElement
      const match = selectedElement?.innerText === value
      if (!match) {
        this.deleteSelectedItem(selectedElement)
      }
      observer.disconnect()
    })
    observer.observe(this.elements.choiceList, {
      childList: true,
      subtree: true,
    })

    this.selectInexact(value)
  }
}
