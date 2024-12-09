import { AnswerValueBackupStrings } from '../../../MoreInfoPopup/AnswerDisplay/AnswerValueDisplay/AnswerValueBackupStrings'
import { createKeyboardEvent } from '@src/shared/utils/events'
import fieldFillerQueue from '@src/shared/utils/fieldFillerQueue'
import {
  getElement,
  getElements,
} from '@src/shared/utils/getElements'
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
    // the only answer elements are added or removed. no need to filter.
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
          if (dropdown.selectAnswer(answerValue)) {
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

  get dropdown(): HTMLElement {
    const XPATH = [`./div`, `[@id="select2-drop"]`].join('')
    return getElement(document.body, XPATH)
  }

  get isOpen(): boolean {
    return this.elements.select2Container.classList.contains(
      'select2-dropdown-open'
    )
  }

  close() {
    this.elements.searchInput.dispatchEvent(
      createKeyboardEvent('keydown', 'Escape')
    )
  }

  open() {
    !this.isOpen && this.elements.searchInput.click()
  }

  get choices(): HTMLElement[] {
    return getElements(this.dropdown, `.//li`)
  }

  hasChoice(value: string): HTMLElement {
    return this.choices.find((el) => el.innerText === value)
  }

  highlightedChoice(): HTMLElement {
    const XPATH = `./ul/li[contains(@class,"select2-highlighted")]`
    return getElement(this.dropdown, XPATH)
  }

  keydownEnter(): void {
    this.elements.searchInput.dispatchEvent(
      createKeyboardEvent('keydown', 'Enter')
    )
  }

  keydownArrowDown(): void {
    this.elements.searchInput.dispatchEvent(
      createKeyboardEvent('keydown', 'ArrowDown')
    )
  }

  /**
   * uses the keyboard to navigate through the list of options by dispatching 
   * keydown events on the search input.
   */
  selectAnswer(value: string): boolean {
    if (!this.hasChoice(value)) {
      return false
    }
    for (let i=0; i<this.choices.length; i++) {
      if (this.highlightedChoice()?.innerText === value) {
        this.keydownEnter()
        return true 
      }
      this.keydownArrowDown()
    }
    return false
  }
}
