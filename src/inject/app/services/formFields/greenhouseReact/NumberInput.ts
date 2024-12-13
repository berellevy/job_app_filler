import { getElement } from "@src/shared/utils/getElements";
import { getReactProps } from "../utils";
import { GreenhouseReactBaseInput } from "./GreenhouseReactBaseInput";
import { xpaths } from "./xpaths";
import AnswerDTO from "../../DTOs/AnswerDTO";



export class NumberInput extends GreenhouseReactBaseInput {
  static XPATH = xpaths.NUMBER_INPUT
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
  async fill(answers: AnswerDTO[]): Promise<void> {
    if (answers.length > 0) {
      const answerValue = answers[0].answer
      this.inputElement.value = answerValue as string
      const reactProps = getReactProps(this.inputElement)
      reactProps?.onChange({currentTarget: this.inputElement})
    }

  }
}