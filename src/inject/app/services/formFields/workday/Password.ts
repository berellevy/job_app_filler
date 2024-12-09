import { getElement } from "@src/shared/utils/getElements"
import { fillReactTextInput } from "../utils"
import { WorkdayBaseInput } from "./WorkdayBaseInput"
import { xpaths } from "./xpaths"

export class Password extends WorkdayBaseInput<string | null> {
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