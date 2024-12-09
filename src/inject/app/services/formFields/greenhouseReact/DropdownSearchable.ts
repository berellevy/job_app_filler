import { AnswerValueBackupStrings } from '../../../MoreInfoPopup/AnswerDisplay/AnswerValueDisplay/AnswerValueBackupStrings'
import fieldFillerQueue from '@src/shared/utils/fieldFillerQueue'
import {
  getElement,
  getElements,
  waitForElement,
} from '@src/shared/utils/getElements'
import { scrollBack } from '@src/shared/utils/scroll'
import { getReactProps } from '../utils'
import { GreenhouseReactBaseInput } from './GreenhouseReactBaseInput'
import { xpaths } from './xpaths'
import { answerValueInitList } from '../../../hooks/answerValueInit'
import { EditableAnswer } from '../../../hooks/useEditableAnswerState'
import { createKeyboardEvent } from '@src/shared/utils/events'
import { sleep } from '@src/shared/utils/async'

export class DropdownSearchable extends GreenhouseReactBaseInput<any> {
  static XPATH = xpaths.DROPDOWN_SEARCHABLE
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

  get labelElement(): HTMLElement {
    return this.elements.label
  }

  public get fieldSnapshot() {
    return {
      path: this.path,
      answer: [this.currentValue()],
    }
  }

  listenForChanges(): void {
    const observer = new MutationObserver((mutations: MutationRecord[]) => {
      const XPATH = `self::*[starts-with(@class, "select__single-value")]`
      if (getElement(mutations, XPATH)) {
        this.triggerReactUpdate()
      }
    })
    observer.observe(this.elements.selectControl, {
      childList: true,
      subtree: true,
    })
  }

  currentValue() {
    return this.elements.selectedValue?.innerText || ''
  }

  clearSelection(): void {
    if (this.elements.clearSelectionButton) {
      const reactProps = getReactProps(this.elements.clearSelectionButton)
      reactProps.onMouseDown({ preventDefault: () => {} })
    }
  }

  public isFilled(current: any, stored: any[]): boolean {
    return stored.includes(current)
  }

  get dropdown(): DropdownContainer {
    return new DropdownContainer(this.elements)
  }

  get elements(): Elements {
    return new Elements(this.element)
  }

  async fill(): Promise<void> {
    // TODO: break out dropdown as separate component.
    await fieldFillerQueue.enqueue(async () => {
      await scrollBack(async () => {
        const answers = await this.answer()
        if (answers.length > 0) {
          this.clearSelection()
          this.dropdown.open()
          if (await this.dropdown.isOpen()) {
            const choices = await this.elements.waitForChoices()
            // pagination of lazy answers is 
            if (choices.length < 100) {
              for (const storedAnswer of answers) {
                const answerValue = storedAnswer.answer[0]
                if (await this.dropdown.fill(answerValue)) {
                  break
                }
              }
            } else {
              for (const storedAnswer of answers) {
                const answerValue = storedAnswer.answer[0]
                if (await this.dropdown.fillBySearch(answerValue)) {
                  break
                }
              }
            }
          }
          this.dropdown.close()
        }
      })
    })
  }
}

class DropdownContainer {
  elements: Elements
  constructor(elements: Elements) {
    this.elements = elements
  }

  async isOpen(): Promise<boolean> {
    return !!(await this.elements.waitForDropdown())
  }

  open(): void {
    this.elements.menuOpenTriggerDivProps?.onMouseUp({
      defaultPrevented: false,
    })
  }

  close(): void {
    this.elements.searchInputProps?.onBlur()
  }

  toggle(): void {
    const reactProps = getReactProps(this.elements.menuOpenTriggerDiv)
    reactProps?.onMouseUp({
      defaultPrevented: false,
    })
  }

  performSearch(value: string): void {
    this.elements.searchInput.value = value
    this.elements.searchInputProps.onChange({
      currentTarget: this.elements.searchInput,
    })
  }

  async getCorrectAnswerElement(value: string): Promise<HTMLElement> {
    const choices = await this.elements.waitForChoices()
    return choices.find((el) => el.innerText === value)
  }



  async fill(value: string): Promise<boolean> {
    const correctChoice = await this.getCorrectAnswerElement(value)
    if (correctChoice) {
      correctChoice.click()
      return true
    }
    return false
  }

  async fillBySearch(value: string): Promise<Boolean> {
    this.performSearch(value)
    const correctAnswerElement = await this.elements.waitForCorrectAnswer(value)
    if (correctAnswerElement) {
      correctAnswerElement.click()
      return true
    }
    return false
  }
}

class Elements {
  element: HTMLElement
  constructor(element: HTMLElement) {
    this.element = element
  }

  get searchInput(): HTMLInputElement {
    return getElement(
      this.element,
      `.//input[@class="select__input"]`
    ) as HTMLInputElement
  }

  get searchInputProps() {
    return getReactProps(this.searchInput)
  }

  /** It's actually the button's parent div that gets the onMouseDown. */
  get clearSelectionButton(): HTMLElement {
    const XPATH = [
      `.//div[starts-with(@class, "select__indicators")]`,
      `/div[@aria-hidden="false"]`,
    ].join('')
    return getElement(this.element, XPATH)
  }

  get selectedValue(): HTMLElement {
    return getElement(
      this.element,
      `.//div[starts-with(@class, "select__single-value")]`
    )
  }

  get selectControl() {
    return getElement(
      this.element,
      `.//div[starts-with(@class, "select__control")]`
    )
  }

  get label(): HTMLElement {
    return getElement(this.element, `.//label`)
  }

  get menuOpenTriggerDiv(): HTMLElement {
    return getElement(
      this.element,
      `.//div[starts-with(@class, "select-shell")]/div[not(@*)]`
    )
  }

  get menuOpenTriggerDivProps() {
    return getReactProps(this.menuOpenTriggerDiv)
  }

  get dropdown(): HTMLElement {
    return getElement(
      this.element,
      `.//div[starts-with(@class, "select__menu")]`
    )
  }

  get choices(): HTMLElement[] {
    return this.dropdown
      ? getElements(
          this.dropdown,
          `.//div[starts-with(@class, "select__option")]`
        )
      : []
  }

  async waitForDropdown(timeout: number = 300): Promise<HTMLElement> {
    return await waitForElement(
      this.element,
      `.//div[starts-with(@class, "select__menu")]`,
      { timeout}
    )
  }

  async waitForChoices(): Promise<HTMLElement[]> {
    const dropdown = await this.waitForDropdown()
    return dropdown
      ? getElements(dropdown, `.//div[starts-with(@class, "select__option")]`)
      : []
  }

  async waitForCorrectAnswer(answerValue: string): Promise<HTMLElement> {
    const dropdownElement = await this.waitForDropdown()
    const XPATH = [
      `.//div`,
      `[starts-with(@class, "select__option")]`,
      `[text() = "${answerValue}"]`,
    ].join('')
    return await waitForElement(dropdownElement, XPATH, { timeout: 200 })
  }
}
