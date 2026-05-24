import { AnswerValueBackupStrings } from "../../../MoreInfoPopup/AnswerDisplay/AnswerValueDisplay/AnswerValueBackupStrings"
import fieldFillerQueue from "@src/shared/utils/fieldFillerQueue"
import { getElement, getElements } from "@src/shared/utils/getElements"
import { SmartRecruitersBaseInput } from "./SmartRecruitersBaseInput"
import { xpaths } from "./xpaths"
import { answerValueInitList } from "../../../hooks/answerValueInit"
import { EditableAnswer } from "../../../hooks/useEditableAnswerState"
import { AnswerValueMethods } from "../baseFormInput"

/**
 * Native `<select>` dropdown. SmartRecruiters uses these for country,
 * salutation, and most per-posting single-choice questions.
 *
 * Fill strategy: match the stored answer against each option's text
 * (case-insensitive trim), set `select.value` to the matching option's
 * value, then dispatch a bubbling `change` event so React's controlled
 * `onChange` fires.
 */
export class Dropdown extends SmartRecruitersBaseInput<string> {
  static XPATH = xpaths.DROPDOWN
  fieldType = "Dropdown"

  get answerValue(): AnswerValueMethods {
    return {
      ...super.answerValue,
      displayComponent: AnswerValueBackupStrings,
      init: answerValueInitList,
      prepForSave: (values: [string, boolean][]): string[] => {
        return values.map(([value]) => value)
      },
      prepForFill: (answers: EditableAnswer[]): string[] => {
        return super.answerValue.prepForFill(answers).flat()
      },
    }
  }

  get fieldSnapshot() {
    return {
      path: this.path,
      answer: [this.currentValue()],
    }
  }

  get inputElement(): HTMLSelectElement | null {
    return getElement(this.element, `.//select`) as HTMLSelectElement | null
  }

  get optionElements(): HTMLOptionElement[] {
    const select = this.inputElement
    if (!select) {
      return []
    }
    return getElements(select, `.//option`) as HTMLOptionElement[]
  }

  listenForChanges(): void {
    this.inputElement?.addEventListener("change", () => {
      this.triggerReactUpdate()
    })
  }

  currentValue(): string {
    const select = this.inputElement
    if (!select) {
      return ""
    }
    const selected = select.options[select.selectedIndex]
    return selected?.text ?? ""
  }

  public isFilled(current: string, stored: string[]): boolean {
    return stored.includes(current)
  }

  async fill(): Promise<void> {
    const select = this.inputElement
    if (!select) {
      return
    }
    const answers = await this.answer()
    if (answers.length === 0) {
      return
    }
    await fieldFillerQueue.enqueue(async () => {
      const { optionElements } = this
      for (const storedAnswer of answers) {
        const answerValues = storedAnswer.answer as string[]
        const target = answerValues?.[0]
        if (!target) {
          continue
        }
        const match = optionElements.find((opt) => {
          return opt.text.trim().toLowerCase() === target.trim().toLowerCase()
        })
        if (match) {
          select.value = match.value
          select.dispatchEvent(new Event("change", { bubbles: true }))
          return
        }
      }
    })
  }
}
