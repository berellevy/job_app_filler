import { useEditableAnswerState } from '../../hooks/useEditableAnswerState'
import { sleep } from '../../utils/async'
import fieldFillerQueue from '../../utils/fieldFillerQueue'
import { getElement } from '../../utils/getElements'
import { FieldPath } from '../../utils/types'
import { getReactProps } from '../baseFormInput'
import { WorkdayBaseInput } from './workdayBaseInput'
import * as xpaths from './xpaths'

export class TextInput extends WorkdayBaseInput<string | null> {
  static XPATH = xpaths.TEXT_INPUT
  fieldType = 'TextInput'
  private internalValue: string | null

  inputElement(): HTMLInputElement {
    return getElement(this.element, './/input') as HTMLInputElement
  }
  /**
   * TODO: explain
   */
  listenForChanges() {
    const callback = (e) => {
      this.internalValue = e.target.value
      this.triggerReactUpdate()
      this.element.removeEventListener('input', callback)
      this.inputElement().removeEventListener('blur', callback)
      sleep(10).then(() => this.listenForChanges())
    }

    this.element.addEventListener('input', callback)
    this.inputElement().addEventListener('blur', callback)
  }

  public currentValue(): string | null {
    return this.internalValue
  }

  public isFilled(current: any, stored: any[]): boolean {
    return current===stored[0]
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
   * and goes ahead calls onBlur again (i think) which sets react state to be a bland string.
   * 
   */
  async fill() {
    const answers = await this.answer()
    if (answers.length > 0 && !(this.isFilled(this.currentValue(), answers.map(a=>a.answer)))) {
      const firstAnswer = answers[0]
      await fieldFillerQueue.enqueue(async () => {
        const reactProps = getReactProps(this.inputElement())
        this.inputElement().value = firstAnswer.answer
        if (reactProps.onChange) {
          reactProps.onChange({ target: { value: firstAnswer.answer } })
        } 
        if (reactProps.onBlur) {  
          reactProps.onBlur({ target: { value: firstAnswer.answer } })
        }
        this.internalValue = firstAnswer.answer
      })
    }
  }
}

export class PasswordInput extends WorkdayBaseInput<string | null> {
  static XPATH = xpaths.PASSWORD_INPUT
  fieldType = 'PasswordInput'

  inputElement(): HTMLInputElement {
    return getElement(this.element, './/input') as HTMLInputElement
  }

  currentValue() {
    return this.inputElement().value
  }

  listenForChanges() {
    this.inputElement().addEventListener('input', (e) => {
      this.triggerReactUpdate()
    })
  }


  public isFilled(current: any, stored: any[]): boolean {
    return current===stored[0]
  }

  async fill() {
    const answer = await this.answer()
    if (answer.length > 0) {
      const reactProps = getReactProps(this.inputElement())
      reactProps.onChange({ target: { value: answer[0].answer } })
    }
  }
}
