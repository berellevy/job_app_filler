import fieldFillerQueue from '../../utils/fieldFillerQueue'
import { getElement, getElements } from '../../utils/getElements'
import { GreenhouseBaseInput } from './GreenhouseBaseInput'
import * as xpaths from './xpaths'

/**
 * Note: "Two or More Races opens a text box, add support eventually"
 * 
 */
export class MultiCheckbox extends GreenhouseBaseInput<any> {
  static XPATH = xpaths.MULTI_CHECKBOX
  fieldType = "SimpleDropdown"
  inputElement(): HTMLInputElement {
    return this.element as HTMLInputElement
  }

  public get fieldName(): string {
    return this.element.childNodes[0].textContent.trim()
  }
  inputDisplayElement(): HTMLElement {
    return getElement(this.element, ".//input[@type='hidden']")
  }
  listenForChanges(): void {
    this.element.addEventListener("click", (e) => {
      if ((e.target as HTMLElement).nodeName === "INPUT") {
        this.triggerReactUpdate()
      }
    })
  }

  get checkboxLabelElements(): HTMLElement[] {
    return getElements(
      this.element,
      ".//label[.//input[@type='checkbox']]"
    )
  }

  get selectedElement(): HTMLElement {
    return this.checkboxLabelElements.find(labelEl => {
      return (labelEl.firstElementChild as HTMLInputElement).checked
    })
  }
  currentValue() {
    return this.selectedElement?.innerText || ""
  }
  async fill(): Promise<void> {
    const answers = await this.answer()
    if (answers.length > 0) {
      await fieldFillerQueue.enqueue(async () => {
        for (const answer of answers) {
          const correctAnswerElement = getElements(
            this.element,
            `.//label`
          ).find(el => el.innerText.trim() === answer.answer.trim())
          if (correctAnswerElement) {
            correctAnswerElement.click()
            break
          }
        }
      })
    }
  }
}