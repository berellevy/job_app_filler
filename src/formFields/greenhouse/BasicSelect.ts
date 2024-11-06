import fieldFillerQueue from '../../utils/fieldFillerQueue'
import { getElement } from '../../utils/getElements'
import { GreenhouseBaseInput } from './GreenhouseBaseInput'
import * as xpaths from './xpaths'

export class BasicSelect extends GreenhouseBaseInput<any> {
  static XPATH: string = xpaths.BASIC_SELECT
  fieldType = 'SimpleDropdown'

  get selectElement(): HTMLSelectElement {
    return getElement(this.element, './/select') as HTMLSelectElement
  }

  inputElement(): HTMLInputElement {
    return this.selectElement as unknown as HTMLInputElement
  }
  listenForChanges(): void {
    this.selectElement.addEventListener("change", () => {
      this.triggerReactUpdate()
    })
  }
  get selectedAnswerElement(): HTMLOptionElement {
    return this.selectElement.selectedOptions[0]
  }
  currentValue(): string {
    return this.selectElement.selectedOptions[0]?.innerText || ''
  }
  async fill(): Promise<void> {
    const answers = await this.answer()
    await fieldFillerQueue.enqueue(async () => {
      for (const answer of answers) {
        const correctAnswerElement = getElement(
          this.selectElement,
          `./option[text() = "${answer.answer}"]`
        ) as HTMLOptionElement
        if (correctAnswerElement) {
          this.selectElement.selectedIndex = correctAnswerElement.index
          break
        }
      }
    })
  }
}