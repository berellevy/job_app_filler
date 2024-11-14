import { AnswerValueBackupStrings } from "../../components/AnswerValueDisplayComponents/AnswerValueBackupStrings";
import { answerValueInitList } from "../../hooks/answerValueInit";
import { EditableAnswer } from "../../hooks/useEditableAnswerState";
import { sleep } from "../../utils/async";
import fieldFillerQueue from "../../utils/fieldFillerQueue";
import { getElement, getElements, waitForElement } from "../../utils/getElements";
import { scrollBack } from "../../utils/scroll";
import { getReactProps } from "../baseFormInput";
import { GreenhouseReactBaseInput } from "./GreenhouseReactBaseInput";
import * as xpaths from './xpaths'


export class DropdownSearchable extends GreenhouseReactBaseInput<any> {
  static XPATH = xpaths.DROPDOWN_SEARCHABLE
  fieldType = "SimpleDropdown"
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
      if (mutations.some(({ addedNodes, removedNodes }) => {
        return (
          [...addedNodes].some(
            (el: HTMLElement) => {
              return (
                el.getAttribute &&
                el.getAttribute('class')?.startsWith('select__single-value')
              )
            }
          ) ||
          [...removedNodes].some(
            (el: HTMLElement) => {
              return (
                el.getAttribute &&
                el.getAttribute('class')?.startsWith('select__single-value')
              )
            }
          )
        )
      })) {
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
      defaultPrevented: false
    })
  }

  openDropdown(): void {
    this.dropdownIsOpen || this.toggleDropdown()
  }

  closeDropdown(): void {
    // this.dropdownIsOpen && this.toggleDropdown()
  }

  get dropdownElement(): HTMLElement {
    return getElement(
      this.element,
      `.//div[starts-with(@class, "select__menu")]`
    )
  }

  async correctAnswerElement(answerValue): Promise<HTMLElement> {
    return await waitForElement(
      this.dropdownElement,
      [
        `.//div`,
        `[starts-with(@class, "select__option")]`,
        `[text() = "${answerValue}"]`,
      ].join("")
    )
  }

  get dropdownIsOpen(): boolean {
    return !!this.dropdownElement
  }

  currentValue() {
    return this.selectedValueElement?.innerText || ""
  }

  get selectControlElement() {
    return getElement(this.element,
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
    return getElement(
      this.element,
      [
        `.//div[starts-with(@class, "select__indicators")]`,
        `/div[@aria-hidden="false"]`
      ].join("")
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
    return getElement(
      this.element,
      `.//input[@class="select__input"]`
    ) as HTMLInputElement
  }

  async fill(): Promise<void> {
    await fieldFillerQueue.enqueue(async () => {
      const answers = await this.answer()
      if (answers.length > 0) {
        this.clearSelection()
        const reactProps = getReactProps(this.searchInputElement)
        for (const storedAnswer of answers) {
          const answerValue = storedAnswer.answer[0]
          this.searchInputElement.value = answerValue
          reactProps.onChange({currentTarget: this.searchInputElement})
          this.openDropdown()
          await sleep(100)
          const correctAnswerElement = await this.correctAnswerElement(answerValue)
          if (correctAnswerElement) {
            correctAnswerElement.click()
            break
          }
        }
        reactProps.onBlur()
      }
    })
  }
}