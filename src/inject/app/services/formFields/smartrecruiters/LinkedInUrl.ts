import fieldFillerQueue from "@src/shared/utils/fieldFillerQueue"
import { getElement } from "@src/shared/utils/getElements"
import { SmartRecruitersBaseInput } from "./SmartRecruitersBaseInput"
import { xpaths } from "./xpaths"
import { fillReactTextInput } from "../utils"

/**
 * Dedicated LinkedIn URL adapter — split out from the generic
 * TextInput so:
 *   - the answer is keyed under a stable `fieldType` ("LinkedInUrl")
 *     instead of whatever label string the posting happens to use;
 *   - we can apply URL-specific validation in the future without
 *     touching the generic text path.
 *
 * Matches `<input type="url">` OR any text input whose `name` /
 * `placeholder` mentions linkedin (case-insensitive — handled in
 * the XPath via XPath 1.0 `translate()`).
 */
export class LinkedInUrl extends SmartRecruitersBaseInput<string> {
  static XPATH = xpaths.LINKEDIN_URL
  fieldType = "LinkedInUrl"

  get inputElement(): HTMLInputElement | null {
    return getElement(
      this.element,
      `.//input[@type="url" or @type="text"]`
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
