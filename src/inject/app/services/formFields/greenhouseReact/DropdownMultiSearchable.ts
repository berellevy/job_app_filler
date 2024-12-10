import { AnswerValueBackupStrings } from "../../../MoreInfoPopup/AnswerDisplay/AnswerValueDisplay/AnswerValueBackupStrings";
import { sleep } from "@src/shared/utils/async";
import fieldFillerQueue from "@src/shared/utils/fieldFillerQueue";
import { getElement, getElements, waitForElement, } from "@src/shared/utils/getElements";
import { scrollBack } from "@src/shared/utils/scroll";
import { fillReactTextInput, getReactProps } from "../utils";
import { GreenhouseReactBaseInput } from "./GreenhouseReactBaseInput";
import { xpaths } from "./xpaths";
import { answerValueInitList } from "../../../hooks/answerValueInit";
import { EditableAnswer } from "../../../hooks/useEditableAnswerState";


/**
 * IMPORTANT!
 * Currently this is a clone of `Dropdown`.
 * the only difference is how current value is detected.
 */
export class DropdownMultiSearchable extends GreenhouseReactBaseInput<any> {
  static XPATH = xpaths.DROPDOWN_MULTI_SEARCHABLE
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
      const XPATH = `.//parent::*//*[starts-with(@class, "select__multi-value")]`
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

  closeDropdown(): void {
    this.dropdownIsOpen && this.toggleDropdown()
  }

  get dropdownElement(): HTMLElement {
    return getElement(
      this.element,
      `.//div[starts-with(@class, "select__menu")]`
    )
  }

  get dropdownIsOpen(): boolean {
    return !!this.dropdownElement
  }

  get answerElements(): HTMLElement[] {
    const { dropdownElement } = this
    return dropdownElement
      ? getElements(
          dropdownElement,
          `.//div[starts-with(@class, "select__option")]`
        )
      : []
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
      `.//div[starts-with(@class, "select__multi-value")]`
    )
  }

  /** It's actually the button's parent div that gets the onMouseDown. */
  get clearSelectionButtonElement(): HTMLElement {
    return getElement(
      this.element,
      [
        `.//div[starts-with(@class, "select__indicators")]`,
        `/div[@aria-hidden="false"]`,
      ].join('')
    )
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
    const input = getElement(
      this.element,
      `.//input[@class="select__input"]`
    ) as HTMLInputElement
    input["reactProps"] = getReactProps(input)
    return input
  }

  async waitForDropdownElement(): Promise<HTMLElement> {
    return await waitForElement(
      this.element, 
      `.//div[starts-with(@class, "select__menu")]`,
      {timeout: 200}
    )
  }

  async waitForCorrectAnswerElement(answerValue): Promise<HTMLElement> {
    const dropdownElement = await this.waitForDropdownElement()
    const XPATH = [
      `.//div`,
      `[starts-with(@class, "select__option")]`,
      `[text() = "${answerValue}"]`,
    ].join("")
    return await waitForElement(dropdownElement, XPATH, { timeout: 200 })
  }

  async fill(): Promise<void> {
    await scrollBack(async () => {
      await fieldFillerQueue.enqueue(async () => {
        const answers = await this.answer()
        if (answers.length > 0) {
          this.clearSelection()
          this.openDropdown()
          for (const storedAnswer of answers) {
            const answerValue = storedAnswer.answer[0]
            if (!answerValue) {
              break
            }
            fillReactTextInput(this.searchInputElement, answerValue)
            const correctAnswerElement = await this.waitForCorrectAnswerElement(
              answerValue
            )
            if (correctAnswerElement) {
              correctAnswerElement.click()
              break
            }
          }
        }
        this.closeDropdown()
      })
    })
  }
}

