import { getElement } from '@src/shared/utils/getElements'
import { GreenhouseBaseInput } from './GreenhouseBaseInput'
import { xpaths } from './xpaths'
import StringDTO from '../../DTOs/StringDTO'
import AnswerDTO from '../../DTOs/AnswerDTO'

export class TextInput extends GreenhouseBaseInput {
  DTO = StringDTO
  static XPATH = xpaths.TEXT_FIELD
  fieldType = 'TextInput'

  inputElement(): HTMLInputElement {
    return getElement(
      this.element,
      ".//input[@type='text']"
    ) as HTMLInputElement
  }

  listenForChanges(): void {
    this.inputElement()?.addEventListener('input', () => {
      this.triggerReactUpdate()
    })
  }
  currentValue() {
    return this.inputElement()?.value
  }
  
  async fill(answers: AnswerDTO<string>[]): Promise<void> {
    if (!this.inputElement) {
      return
    }
    const firstAnswer = answers[0]
    this.inputElement().value = firstAnswer.answer
    this.inputElement().dispatchEvent(new InputEvent('input'))
  }
}