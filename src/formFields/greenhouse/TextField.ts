import fieldFillerQueue from "../../utils/fieldFillerQueue";
import { getElement } from "../../utils/getElements";
import { GreenhouseBaseInput } from "./GreenhouseBaseInput";
import * as xpaths from "./xpaths";

export class TextField extends GreenhouseBaseInput<any> {
  static XPATH = xpaths.TEXT_FIELD
  fieldType = 'TextInput'

  inputElement(): HTMLInputElement {
    return getElement(this.element, ".//input[@type='text']") as HTMLInputElement
  }

  listenForChanges(): void {
    this.inputElement()?.addEventListener("input", () => {
      this.triggerReactUpdate()
    })
  }
  currentValue() {
    return this.inputElement()?.value
  }
  async fill(): Promise<void> {
    const answers = await this.answer()
    if (this.inputElement() && answers.length > 0){
      const firstAnswer = answers[0]
      await fieldFillerQueue.enqueue(async () => {
        this.inputElement().value = firstAnswer.answer
        this.inputElement().dispatchEvent(new InputEvent("input"))
      })
    }
  }
  
}