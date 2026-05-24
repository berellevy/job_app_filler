import { AnswerValueBackupStrings } from '../../../MoreInfoPopup/AnswerDisplay/AnswerValueDisplay/AnswerValueBackupStrings'
import fieldFillerQueue from '@src/shared/utils/fieldFillerQueue'
import { getElement } from '@src/shared/utils/getElements'
import stringMatch from '@src/shared/utils/stringMatch'
import { IcimsBaseInput } from './IcimsBaseInput'
import { xpaths } from './xpaths'
import { answerValueInitList } from '../../../hooks/answerValueInit'
import { EditableAnswer } from '../../../hooks/useEditableAnswerState'
import { AnswerValueMethods } from '../baseFormInput'

/**
 * iCIMS custom-question single-select dropdown.
 *
 * iCIMS renders custom recruiting fields as native `<select>` controls whose
 * `name`/`id` use the `rcf<N>` convention (e.g. `rcf123`), alongside the
 * `applicant.<field>` selects on the core profile. Because these are native
 * `<select>` elements (not a custom Select2/listbox widget like Greenhouse),
 * we can avoid the open/close dance and simply set `selectedIndex` then
 * dispatch `change`, exactly as the Lever dropdown does.
 *
 * Option-matching uses `stringMatch.exact` first (case-insensitive) and falls
 * back to `stringMatch.contains` to catch labels carrying extra whitespace or
 * required-marker glyphs.
 */
export class Dropdown extends IcimsBaseInput<string> {
  static XPATH: string = xpaths.CUSTOM_DROPDOWN
  fieldType = 'SimpleDropdown'

  public get answerValue(): AnswerValueMethods {
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

  public get fieldSnapshot() {
    return {
      path: this.path,
      answer: [this.currentValue()],
    }
  }

  get selectElement(): HTMLSelectElement {
    return getElement(
      this.element,
      [
        ".//select[starts-with(@name, 'rcf')",
        " or starts-with(@id, 'rcf')",
        " or starts-with(@name, 'applicant.')]",
      ].join('')
    ) as HTMLSelectElement
  }

  inputElement(): HTMLInputElement {
    return this.selectElement as unknown as HTMLInputElement
  }

  listenForChanges(): void {
    this.selectElement?.addEventListener('change', () => {
      this.triggerReactUpdate()
    })
  }

  currentValue(): string {
    return this.selectElement?.selectedOptions[0]?.innerText || ''
  }

  private findMatchingOption(target: string): HTMLOptionElement | null {
    const select = this.selectElement
    if (!select) {
      return null
    }
    const options = Array.from(select.options)
    const config = { caseSensitive: false }

    const exactHit = options.find((opt) =>
      stringMatch.exact(opt.innerText, target, config)
    )
    if (exactHit) {
      return exactHit
    }

    const containsHit = options.find((opt) =>
      stringMatch.contains(opt.innerText, target, config)
    )
    return containsHit || null
  }

  async fill(): Promise<void> {
    const answers = await this.answer()
    const select = this.selectElement
    if (!select || answers.length === 0) {
      return
    }
    await fieldFillerQueue.enqueue(async () => {
      for (const answer of answers) {
        const target =
          typeof answer.answer === 'string' ? answer.answer : answer.answer?.[0]
        if (!target) {
          continue
        }
        const option = this.findMatchingOption(target)
        if (option) {
          select.selectedIndex = option.index
          select.dispatchEvent(new Event('change', { bubbles: true }))
          break
        }
      }
    })
  }
}
