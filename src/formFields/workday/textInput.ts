import { getElement } from '../../utils/getElements'
import { BaseFormInput, getReactProps } from '../baseFormInput'
import * as xpaths from './xpaths'

export class TextInput extends BaseFormInput<string | null> {
  static XPATH = xpaths.TEXT_INPUT
  fieldType = 'TextInput'
  realValue: string | null

  inputElement(): HTMLInputElement {
    return getElement(this.element, './/input') as HTMLInputElement
  }

  listenForChanges() {
    const callback = (e) => {
      this.triggerReactUpdate()
      this.element.removeEventListener('input', callback)
      this.inputElement().removeEventListener('blur', callback)
      this.realValue = e.target.value
      setTimeout(() => this.listenForChanges(), 0)
    }

    this.element.addEventListener('input', callback)
    this.inputElement().addEventListener('blur', callback)
  }

  currentValue(): string | null {
    return this.realValue
  }

  async fill() {
    if (await this.hasAnswer()) {
      const answer = await this.answer()
      const reactProps = getReactProps(this.inputElement())
      if (reactProps.onChange) {
        reactProps.onChange({ target: { value: answer } })
      } else if (reactProps.onBlur) {
        reactProps.onBlur({ target: { value: answer } })
      }
      this.realValue = answer
    }

    setTimeout(() => {
      this.triggerReactUpdate()
    }, 0)
  }
}

export class PasswordInput extends BaseFormInput<string | null> {
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

  async fill() {
    if (await this.hasAnswer()) {
      const answer = await this.answer()
      const reactProps = getReactProps(this.inputElement())
      reactProps.onChange({ target: { value: answer } })
    }
  }
}
