import fieldFillerQueue from "@src/shared/utils/fieldFillerQueue"
import { getElement } from "@src/shared/utils/getElements"
import { SmartRecruitersBaseInput } from "./SmartRecruitersBaseInput"
import { xpaths } from "./xpaths"
import { fillReactTextInput } from "../utils"

/**
 * Standard text input — firstName, lastName, location, free-text custom
 * questions, etc. SmartRecruiters is React-controlled so we fire the
 * underlying `onChange` prop rather than a bare DOM input event.
 */
export class TextInput extends SmartRecruitersBaseInput<string> {
  static XPATH = xpaths.TEXT_FIELD
  fieldType = "TextInput"

  get inputElement(): HTMLInputElement | null {
    return getElement(
      this.element,
      `.//input[@type="text"]`
    ) as HTMLInputElement | null
  }

  listenForChanges(): void {
    this.inputElement?.addEventListener("input", () => {
      this.triggerReactUpdate()
    })
  }

  currentValue(): string {
    return this.inputElement?.value ?? ""
  }

  async fill(): Promise<void> {
    const input = this.inputElement
    if (!input) {
      return
    }
    const answers = await this.answer()
    if (answers.length === 0) {
      return
    }
    const firstAnswer = answers[0]
    await fieldFillerQueue.enqueue(async () => {
      fillReactTextInput(input, firstAnswer.answer as string)
    })
  }
}
