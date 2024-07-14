import { getElement } from '../utils/getElements'
import { BaseFormInput, getReactProps } from './baseFormInput'
import * as xpaths from './xpaths'


export class TextInput extends BaseFormInput<string | null> {
  static XPATH = xpaths.TEXT_INPUT
  fieldType = 'TextInput'

  inputElement(): HTMLInputElement {
    return getElement(this.element, './/input') as HTMLInputElement
  }

  listenForChanges() {
    this.inputElement().addEventListener('input', (e) => {
      this.triggerReactUpdate()
    })
  }

  currentValue(): string | null {
    return this.inputElement().value
  }

  async fill() {
    const answer = await this.answer()
    const reactProps = getReactProps(this.inputElement())
    reactProps.onChange({ target: { value: answer } })
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
    if (await this.hasAnswer()){
      const answer = await this.answer()
      const reactProps = getReactProps(this.inputElement())
      reactProps.onChange({ target: { value: answer } })
    }
  }
}

export const RegisterInputs = async (node: Node = document) => {
  Promise.all([TextInput.autoDiscover(node), PasswordInput.autoDiscover(node)])
}
