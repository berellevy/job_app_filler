import { AnswerValueBackupStrings } from "../../../MoreInfoPopup/AnswerDisplay/AnswerValueDisplay/AnswerValueBackupStrings";
import { sleep } from "@src/shared/utils/async";
import fieldFillerQueue from "@src/shared/utils/fieldFillerQueue";
import { getElement, getElements } from "@src/shared/utils/getElements";
import { getReactProps } from "../utils";
import { GreenhouseReactBaseInput } from "./GreenhouseReactBaseInput";
import { xpaths } from "./xpaths";
import { answerValueInitList } from "../../../hooks/answerValueInit";
import { EditableAnswer } from "../../../hooks/useEditableAnswerState";



/**
 * Not using this for now. Only searchable.
 * 
 */
export class Dropdown extends GreenhouseReactBaseInput<any> {
  static XPATH = xpaths.DROPDOWN
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
    const {dropdownElement} = this
    return dropdownElement 
    ? getElements(
      dropdownElement,
      `.//div[starts-with(@class, "select__option")]`
    )
    : []
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
  async fill(): Promise<void> {
    await fieldFillerQueue.enqueue(async () => {
      const answers = await this.answer()
      if (answers.length > 0) {
        this.clearSelection()
        this.openDropdown()
        await sleep(100)
        const {answerElements} = this
        for (const storedAnswer of answers) {
          const answerValue = storedAnswer.answer[0]
          if (!answerValue) {
            break
          }
          const correctAnswerElement = answerElements.find((el) => { 
            return el.innerText === answerValue
          })
          if (correctAnswerElement) {
            correctAnswerElement.click()
            break
          }
        }
      }
      this.closeDropdown()
    })
    
    
  }

  
}