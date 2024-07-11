import React from 'react'
import { getElement } from '../utils/getElements'
import '@fontsource/roboto'
import { BaseFormInput, getReactProps } from './baseFormInput'
import * as xpaths from './xpaths'


type TextAnswerType = string | null


export class TextInput extends BaseFormInput<TextAnswerType> {
  static XPATH = xpaths.TEXT_INPUT
  fieldType = "TextInput"
  
  public get inputElement(): HTMLInputElement {
    return getElement(this.element, './/input') as HTMLInputElement
  }

  listenForChanges() {
    this.inputElement.addEventListener("input", (e) => {
      this.triggerReactUpdate()
    })
  }

  public currentValue(): TextAnswerType {
    return this.inputElement.value
  }

  async answer(): Promise<TextAnswerType> {
    const res =  await this.fetchAnswer<TextAnswerType>()
    return res.answer
  }

  async fill() {
    const answer = await this.answer()
    const reactProps = getReactProps(this.inputElement)
    reactProps.onChange({ target: { value: answer } })
  }
}


export class PasswordInput extends BaseFormInput<TextAnswerType>{
  static XPATH = xpaths.PASSWORD_INPUT
  fieldType = "PasswordInput"

  public get inputElement(): HTMLInputElement {
    return getElement(this.element, './/input') as HTMLInputElement
  }

  currentValue(): string | null {
    return this.inputElement.value
  }

  listenForChanges() {
    this.inputElement.addEventListener("input", (e) => {
      this.triggerReactUpdate()
    })
  }

  async answer(): Promise<TextAnswerType> {
    const res = await this.fetchAnswer<TextAnswerType>()
    return res.answer
  }
}



export const RegisterInputs = async (node: Node = document) => {
  Promise.all([TextInput.autoDiscover(node), PasswordInput.autoDiscover(node)])
}

