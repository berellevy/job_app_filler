import fieldFillerQueue from "@src/shared/utils/fieldFillerQueue";
import { getElement } from "@src/shared/utils/getElements";
import { GreenhouseBaseInput } from "./GreenhouseBaseInput";
import { xpaths } from './xpaths'
import AnswerDTO from "../../DTOs/AnswerDTO";

export class Textarea extends GreenhouseBaseInput {
  static XPATH = xpaths.TEXTAREA
  fieldType = 'TextInput'

  inputElement(): HTMLInputElement {
    return getElement(this.element, ".//textarea") as HTMLInputElement
  }

  listenForChanges(): void {
    this.inputElement()?.addEventListener("input", () => {
      this.triggerReactUpdate()
    })
  }

  currentValue() {
    return this.inputElement()?.value
  }

  async fill(answers: AnswerDTO<string>[]): Promise<void> {
    if (!this.inputElement()) {
      return
    }
    const firstAnswer = answers[0]
    this.inputElement().value = firstAnswer.answer
    this.inputElement().dispatchEvent(new InputEvent("input"))
  }



}