import React from 'react'
import { getElement, getElements } from '../utils/getElements'
import '@fontsource/roboto'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import { BaseFormInput } from './baseFormInput'
import { TEXT_INPUT } from './xpaths'

export class TextInput extends BaseFormInput {
  static XPATH = TEXT_INPUT

  public get inputElement(): HTMLInputElement {
    return getElement(this.element, './/input') as HTMLInputElement
  }
  public get currentValue(): string | null {
    return this.inputElement.value
  }

  public get reactProps(): any {
    for (const key in this.element) {
      if (key.startsWith('__reactProps')) return this.element[key]
    }
  }
}

export class PasswordInput extends BaseFormInput {
  static XPATH = `
    .//div
    [starts-with(@data-automation-id, 'formField-')]
    [.//input[@type='password']]
    [not(.//*[@aria-haspopup])]
    `
  public get inputElement(): HTMLInputElement {
    return getElement(this.element, './/input') as HTMLInputElement
  }
  public get currentValue(): string | null {
    return this.inputElement.value
  }

  public get reactProps(): any {
    for (const key in this.element) {
      if (key.startsWith('__reactProps')) return this.element[key]
    }
  }
}

export const RegisterInputs = async (node: Node = document) => {
  Promise.all([TextInput.autoDiscover(node), PasswordInput.autoDiscover(node)])
}
