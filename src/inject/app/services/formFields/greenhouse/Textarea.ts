import fieldFillerQueue from "@src/shared/utils/fieldFillerQueue";
import { getElement } from "@src/shared/utils/getElements";
import { GreenhouseBaseInput } from "./GreenhouseBaseInput";
import { xpaths } from './xpaths'

export class Textarea extends GreenhouseBaseInput<any> {
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