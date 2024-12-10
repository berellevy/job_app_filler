import { AnswerValueBackupStrings } from '../../../MoreInfoPopup/AnswerDisplay/AnswerValueDisplay/AnswerValueBackupStrings'
import { sleep } from '@src/shared/utils/async'
import fieldFillerQueue from '@src/shared/utils/fieldFillerQueue'
import {
  getElement,
  waitForElement,
} from '@src/shared/utils/getElements'
import { scrollBack } from '@src/shared/utils/scroll'
import { getReactProps } from '../utils'
import { GreenhouseReactBaseInput } from './GreenhouseReactBaseInput'
import { xpaths } from './xpaths'
import { answerValueInitList } from '../../../hooks/answerValueInit'
import { EditableAnswer } from '../../../hooks/useEditableAnswerState'

export class AddressSearchable extends GreenhouseReactBaseInput<any> {
  static XPATH = xpaths.ADDRESS_SEARCHABLE
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
  get labelElement(): HTMLElement {
    return getElement(this.element, `.//label`)
  }
  listenForChanges(): void {
    const observer = new MutationObserver((mutations: MutationRecord[]) => {
      const XPATH = `self::*[starts-with(@class, "select__single-value")]`
      if (getElement(mutations, XPATH)) {
        this.triggerReactUpdate()
      }
    })
    observer.observe(this.selectControlElement, {
      childList: true,
      subtree: true,
    })
  }

  get menuOpenTriggerDivElement(): HTMLElement {
    return getElement(
      this.element,
      `.//div[starts-with(@class, "select-shell")]/div[not(@*)]`
    )
  }

  toggleDropdown(): void {
    const reactProps = getReactProps(this.menuOpenTriggerDivElement)
    reactProps?.onMouseUp({
      defaultPrevented: false,
    })
  }

  openDropdown(): void {
    this.dropdownIsOpen || this.toggleDropdown()
  }

  get dropdownElement(): HTMLElement {
    return getElement(
      this.element,
      `.//div[starts-with(@class, "select__menu")]`
    )
  }

  async waitForDropdownElement(): Promise<HTMLElement> {
    return await waitForElement(
      this.element,
      `.//div[starts-with(@class, "select__menu")]`,
      { timeout: 500 }
    )
  }

  async waitForCorrectAnswerElement(answerValue): Promise<HTMLElement> {
    const dropdownElement = await this.waitForDropdownElement()
    const XPATH = [
      `.//div`,
      `[starts-with(@class, "select__option")]`,
      `[text() = "${answerValue}"]`,
    ].join('')
    return await waitForElement(dropdownElement, XPATH, { timeout: 500 })
  }

  correctAnswerElement(answerValue): HTMLElement {
    const XPATH = [
      `.//div`,
      `[starts-with(@class, "select__option")]`,
      `[text() = "${answerValue}"]`,
    ].join('')
    return getElement(this.dropdownElement, XPATH)
  }

  get dropdownIsOpen(): boolean {
    return !!this.dropdownElement
  }

  currentValue() {
    return this.selectedValueElement?.innerText || ''
  }

  get selectControlElement() {
    return getElement(
      this.element,
      `.//div[starts-with(@class, "select__control")]`
    )
  }

  get selectedValueElement(): HTMLElement {
    return getElement(
      this.element,
      `.//div[starts-with(@class, "select__single-value")]`
    )
  }

  /** It's actually the button's parent div that gets the onMouseDown. */
  get clearSelectionButtonElement(): HTMLElement {
    const XPATH = [
      `.//div[starts-with(@class, "select__indicators")]`,
      `/div[@aria-hidden="false"]`,
    ].join('')
    return getElement(this.element, XPATH)
  }

  clearSelection(): void {
    if (this.clearSelectionButtonElement) {
      const reactProps = getReactProps(this.clearSelectionButtonElement)
      reactProps.onMouseDown({ preventDefault: () => {} })
    }
  }

  public isFilled(current: any, stored: any[]): boolean {
    return stored.includes(current)
  }

  get searchInputElement(): HTMLInputElement {
    return getElement(
      this.element,
      `.//input[@class="select__input"]`
    ) as HTMLInputElement
  }

  async fill(): Promise<void> {
    await fieldFillerQueue.enqueue(async () => {
      await scrollBack(async () => {
        const answers = await this.answer()
        if (answers.length > 0) {
          this.clearSelection()
          this.openDropdown()
          const reactProps = getReactProps(this.searchInputElement)
          for (const storedAnswer of answers) {
            const answerValue = storedAnswer.answer[0]
            this.searchInputElement.value = answerValue
            reactProps?.onChange({ currentTarget: this.searchInputElement })
            const correctAnswerElement = await this.waitForCorrectAnswerElement(
              answerValue
            )
            if (correctAnswerElement) {
              correctAnswerElement.click()
              break
            }
          }
          reactProps?.onBlur()
        }
      })
    })
  }
}
