import fieldFillerQueue from '@src/shared/utils/fieldFillerQueue'
import { getElement } from '@src/shared/utils/getElements'
import { GreenhouseBaseInput } from './GreenhouseBaseInput'
import { xpaths } from './xpaths'
import AnswerDTO from '../../DTOs/AnswerDTO'

export class Select extends GreenhouseBaseInput {
  static XPATH: string = xpaths.BASIC_SELECT
  fieldType = 'Dropdown'

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
  async fill(answers: AnswerDTO<string>[]): Promise<void> {
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
