import fieldFillerQueue from '@src/shared/utils/fieldFillerQueue'
import { getElement } from '@src/shared/utils/getElements'
import { GreenhouseBaseInput } from './GreenhouseBaseInput'
import { xpaths } from './xpaths'
import StringDTO from '../../DTOs/StringDTO'
import { FieldPath, Answer } from '@src/shared/utils/types'

export class TextInput extends GreenhouseBaseInput<any> {
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

  async answer(path?: FieldPath): Promise<Answer[]> {
    const answers = await super.answer()
    return answers.map((answer106) => {
      const {
        answer,
        id,
        matchType,
        path: { section, fieldName },
      } = answer106
      return new this.DTO({ answer, id, matchType, section, fieldName })
    })
  }
  async fill(): Promise<void> {
    const answers = await this.answer()
    if (this.inputElement() && answers.length > 0) {
      const firstAnswer = answers[0]
      this.inputElement().value = firstAnswer.answer
      this.inputElement().dispatchEvent(new InputEvent('input'))
    }
  }
}
