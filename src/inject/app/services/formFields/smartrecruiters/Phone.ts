import fieldFillerQueue from "@src/shared/utils/fieldFillerQueue"
import { getElement } from "@src/shared/utils/getElements"
import { SmartRecruitersBaseInput } from "./SmartRecruitersBaseInput"
import { xpaths } from "./xpaths"
import { fillReactTextInput } from "../utils"

/**
 * Phone field. SR renders a country-code prefix `<select>` next to a
 * `<input type="tel">`. We only autofill the tel input — the country
 * code is left to the user (or to a future enhancement) because
 * stored answers are flat strings and we don't want to half-fill a
 * compound field.
 */
export class Phone extends SmartRecruitersBaseInput<string> {
  static XPATH = xpaths.PHONE
  fieldType = "Phone"

  get inputElement(): HTMLInputElement | null {
    return getElement(
      this.element,
      `.//input[@type="tel"]`
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
