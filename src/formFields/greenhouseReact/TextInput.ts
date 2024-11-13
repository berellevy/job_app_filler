import { getElement } from "../../utils/getElements";
import { getReactProps } from "../baseFormInput";
import { GreenhouseReactBaseInput } from "./GreenhouseReactBaseInput";
import * as xpaths from './xpaths'



export class TextInput extends GreenhouseReactBaseInput<any> {
  static XPATH = xpaths.TEXT_INPUT
  fieldType = 'TextInput'
  
  get labelElement(): HTMLElement {
    return getElement(this.element, `.//label`)
  }

  get inputElement(): HTMLInputElement {
    return getElement(this.element, './/input') as HTMLInputElement
  }

  listenForChanges(): void {
    this.inputElement.addEventListener("input", () => {
      this.triggerReactUpdate()
    })
  }

  currentValue() {
    return this.inputElement.value
  }
  async fill(): Promise<void> {
    const answers = await this.answer()
    if (answers.length > 0) {
      const firstAnswer = answers[0]
      this.inputElement.value = firstAnswer.answer
      const reactProps = getReactProps(this.inputElement)
      reactProps?.onChange({currentTarget: this.inputElement})
    }

  }
}