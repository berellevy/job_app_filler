import fieldFillerQueue from '@src/shared/utils/fieldFillerQueue'
import { getElement } from '@src/shared/utils/getElements'
import { fillReactTextInput } from '../utils'
import { WorkdayBaseInput } from './WorkdayBaseInput'
import { xpaths } from './xpaths'
import AnswerDTO from '../../DTOs/AnswerDTO'

export class TextArea extends WorkdayBaseInput {
  static XPATH = xpaths.TEXT_AREA
  fieldType = 'TextInput'
  private internalValue: string | null

  get inputElement(): HTMLInputElement {
    return getElement(this.element, './/textarea') as HTMLInputElement
  }

  listenForChanges() {
    this.element.addEventListener('input', () => this.triggerReactUpdate())
    this.inputElement.addEventListener('blur', () => this.triggerReactUpdate())
  }

  currentValue(): string | null {
    return this.inputElement.value
  }

  public isFilled(current: any, stored: any[]): boolean {
    return current === stored[0]
  }

  async fill(answers: AnswerDTO<string>[]): Promise<void> {
    await fieldFillerQueue.enqueue(async () => {
      if (answers.length > 0) {
        fillReactTextInput(this.inputElement, answers[0].answer, {
          eventName: 'onBlur',
        })
      }
    })
  }
}
