import { getElement } from "@src/shared/utils/getElements";
import { getReactProps } from "../utils";
import { GreenhouseReactBaseInput } from "./GreenhouseReactBaseInput";
import { xpaths } from "./xpaths";
import AnswerDTO from "../../DTOs/AnswerDTO";



export class Textarea extends GreenhouseReactBaseInput {
  static XPATH = xpaths.TEXTAREA
  fieldType = 'TextInput'
  
  get labelElement(): HTMLElement {
    return getElement(this.element, `.//label`)
  }

  get inputElement(): HTMLInputElement {
    return getElement(this.element, './/textarea') as HTMLInputElement
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
      const firstAnswer = answers[0]
      this.inputElement.value = firstAnswer.answer as string
      const reactProps = getReactProps(this.inputElement)
      reactProps?.onChange({currentTarget: this.inputElement})
    }

  }
}