import { useEditableAnswerState } from '../../hooks/useEditableAnswerState'
import { sleep } from '../../utils/async'
import fieldFillerQueue from '../../utils/fieldFillerQueue'
import { getElement } from '../../utils/getElements'
import { FieldPath } from '../../utils/types'
import { fillReactTextInput, getReactProps } from '../utils'
import { WorkdayBaseInput } from './workdayBaseInput'
import * as xpaths from './xpaths'

export class TextInput extends WorkdayBaseInput<string | null> {
  static XPATH = xpaths.TEXT_INPUT
  fieldType = 'TextInput'

  listenForChanges() {
    this.element.addEventListener('input', () => this.triggerReactUpdate())
    this.inputElement.addEventListener('blur', () => this.triggerReactUpdate())
  }

  get inputElement(): HTMLInputElement {
    return getElement(this.element, './/input') as HTMLInputElement
  }

  public currentValue(): string | null {
    return this.inputElement.value
  }

  public isFilled(current: any, stored: any[]): boolean {
    return current === stored[0]
  }

  /**
   * first set the value of the input element (this alone is NOT enough ).
   * then fire onChange event for elements that update state that way or
   * onBlur event (usually elements that have client side validation)
   *
   * The reason we set the value of the input element first is in some cases the
   * the blur event fires before react is able to update the value attr of the
   * input element. What ends up happening is the fill method fills the field but
   * the listenForChanges method gets the blur event with the target.value still blank
   * and goes ahead calls onBlur again (i think) which sets react state to be a blank string.
   */
  async fill() {
    const answers = await this.answer()
    if (
      answers.length > 0 &&
      !this.isFilled(
        this.currentValue(),
        answers.map((a) => a.answer)
      )
    ) {
      const firstAnswer = answers[0]
      await fieldFillerQueue.enqueue(async () => {
        const reactProps = getReactProps(this.inputElement)
        this.inputElement.value = firstAnswer.answer
        if (reactProps.onChange) {
          reactProps.onChange({ target: this.inputElement })
        }
        if (reactProps.onBlur) {
          reactProps.onBlur({ target: this.inputElement })
        }
      })
    }
  }
}

export class PasswordInput extends WorkdayBaseInput<string | null> {
  static XPATH = xpaths.PASSWORD_INPUT
  fieldType = 'PasswordInput'

  get inputElement(): HTMLInputElement {
    return getElement(this.element, './/input') as HTMLInputElement
  }

  currentValue() {
    return this.inputElement.value
  }

  listenForChanges() {
    this.inputElement.addEventListener('input', (e) => {
      this.triggerReactUpdate()
    })
  }

  public isFilled(current: any, stored: any[]): boolean {
    return current === stored[0]
  }

  async fill() {
    const answer = await this.answer()
    if (answer.length > 0) {
      fillReactTextInput(this.inputElement, answer[0].answer)
    }
  }
}
