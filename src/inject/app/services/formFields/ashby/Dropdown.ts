import { AnswerValueBackupStrings } from '../../../MoreInfoPopup/AnswerDisplay/AnswerValueDisplay/AnswerValueBackupStrings'
import { sleep } from '@src/shared/utils/async'
import fieldFillerQueue from '@src/shared/utils/fieldFillerQueue'
import {
  getElement,
  getElements,
  waitForElement,
} from '@src/shared/utils/getElements'
import stringMatch from '@src/shared/utils/stringMatch'
import { Answer } from '@src/shared/utils/types'
import { answerValueInitList } from '../../../hooks/answerValueInit'
import { EditableAnswer } from '../../../hooks/useEditableAnswerState'
import { AnswerValueMethods } from '../baseFormInput'
import { AshbyBaseInput } from './AshbyBaseInput'
import { xpaths } from './xpaths'
import { dispatchMouseSequence, setNativeValue, setNativeSelectValue } from './utils'

/** Case-insensitive matcher config shared across option lookups. */
const MATCH_CONFIG = { caseSensitive: false } as const

/**
 * Single-select dropdown. Ashby (a React app) renders two shapes:
 *   1. A native `<select>` element (simplest custom questions).
 *   2. A react-select combobox: an `<input role="combobox">` that filters
 *      a `[role="listbox"]` of `[role="option"]` items as you type.
 *
 * We support both. Native selects are filled by setting `.value` via the
 * native setter. Comboboxes are driven the way a user would — focus the
 * input, type the answer (via the native value setter so React's onChange
 * fires and the option list filters), wait for the listbox, then dispatch
 * a full mousedown/mouseup/click sequence on the matching option. A plain
 * `.click()` is unreliable for react-select, which commits selection on
 * `mousedown`.
 *
 * Verified against live Ashby forms via two open-source autofillers:
 *   - dbpb0214/chrome-ext-job-tracker (content.js): types into
 *     `input[role="combobox"]`, observes `[role="listbox"] [role="option"]`,
 *     fires mousedown/mouseup/click on the option.
 *   - KyleMoore1/grepjob-autofill (content.js `readAshbyFields`): native
 *     setter to filter, then clicks `div[role="listbox"] div[role="option"]`.
 */
export class Dropdown extends AshbyBaseInput<string[]> {
  static XPATH: string = xpaths.DROPDOWN
  fieldType: string = 'SimpleDropdown'

  public get answerValue(): AnswerValueMethods {
    return {
      ...super.answerValue,
      displayComponent: AnswerValueBackupStrings,
      init: answerValueInitList,
      prepForSave: (values: [string, boolean][]): string[] => {
        return values.map(([value]) => value)
      },
      prepForFill: (answers: EditableAnswer[]): string[] => {
        return super.answerValue.prepForFill(answers).flat() as string[]
      },
    }
  }

  public get fieldSnapshot() {
    return {
      path: this.path,
      answer: [this.currentValue()],
    }
  }

  get labelElement(): HTMLElement {
    return getElement(this.element, `.//label`)
  }

  get nativeSelectElement(): HTMLSelectElement | null {
    return getElement(this.element, `.//select`) as HTMLSelectElement | null
  }

  get comboboxElement(): HTMLElement | null {
    return getElement(this.element, `.//*[@role="combobox"]`)
  }

  /**
   * The typeable input for a react-select combobox. Ashby usually puts
   * `role="combobox"` directly on the `<input>`, but some versions render
   * the role on a wrapper with the `<input>` nested inside — handle both.
   */
  get comboboxInputElement(): HTMLInputElement | null {
    const combobox = this.comboboxElement
    if (!combobox) {
      return null
    }
    if (combobox instanceof HTMLInputElement) {
      return combobox
    }
    return getElement(combobox, `.//input`) as HTMLInputElement | null
  }

  listenForChanges(): void {
    const select = this.nativeSelectElement
    if (select) {
      select.addEventListener('change', () => this.triggerReactUpdate())
      return
    }
    const combobox = this.comboboxElement
    if (!combobox) {
      return
    }
    const observer = new MutationObserver(() => this.triggerReactUpdate())
    observer.observe(combobox, {
      attributes: true,
      attributeFilter: ['aria-expanded', 'aria-activedescendant'],
      childList: true,
      subtree: true,
    })
  }

  currentValue(): string {
    const select = this.nativeSelectElement
    if (select) {
      const selectedOption = select.options[select.selectedIndex]
      return selectedOption?.text ?? ''
    }
    const combobox = this.comboboxElement
    if (combobox) {
      // react-select shows the chosen value in a `.select__single-value`
      // node next to the input; fall back to the input's own value, then
      // to the wrapper's visible text.
      const singleValue = getElement(
        this.element,
        `.//*[contains(@class, "single-value") or contains(@class, "singleValue")]`
      )
      if (singleValue?.innerText) {
        return singleValue.innerText.trim()
      }
      const input = this.comboboxInputElement
      if (input?.value) {
        return input.value.trim()
      }
      return combobox.innerText?.trim() ?? ''
    }
    return ''
  }

  public isFilled(current: string, stored: string[][]): boolean {
    return stored.some((arr) => arr.includes(current))
  }

  private wantedValue(storedAnswer: Answer): string {
    const answer = storedAnswer.answer as unknown
    if (Array.isArray(answer)) {
      return typeof answer[0] === 'string' ? answer[0] : ''
    }
    return typeof answer === 'string' ? answer : ''
  }

  private async fillNative(answers: Answer[]): Promise<void> {
    const select = this.nativeSelectElement
    if (!select) {
      return
    }
    const options = Array.from(select.options)
    for (const storedAnswer of answers) {
      const wanted = this.wantedValue(storedAnswer)
      if (!wanted) {
        continue
      }
      const match =
        options.find(
          (opt) =>
            stringMatch.exact(opt.text, wanted, MATCH_CONFIG) ||
            stringMatch.exact(opt.value, wanted, MATCH_CONFIG)
        ) ??
        options.find((opt) => stringMatch.contains(opt.text, wanted, MATCH_CONFIG))
      if (match) {
        setNativeSelectValue(select, match.value)
        return
      }
    }
  }

  /**
   * Locate the open react-select listbox. Prefer the element referenced by
   * the combobox's `aria-controls`; otherwise fall back to the first
   * `[role="listbox"]` anywhere in the document (react-select portals its
   * menu to `<body>`, so it is not necessarily inside `this.element`).
   */
  private async waitForListbox(): Promise<HTMLElement | null> {
    const combobox = this.comboboxElement
    const listboxId = combobox?.getAttribute('aria-controls')
    if (listboxId) {
      const byId = document.getElementById(listboxId)
      if (byId) {
        return byId
      }
    }
    return waitForElement(document, `.//*[@role="listbox"]`, { timeout: 1000 })
  }

  private findOption(
    options: HTMLElement[],
    wanted: string
  ): HTMLElement | null {
    const exactHit = options.find((opt) =>
      stringMatch.exact(opt.innerText?.trim() ?? '', wanted, MATCH_CONFIG)
    )
    if (exactHit) {
      return exactHit
    }
    return (
      options.find((opt) =>
        stringMatch.contains(opt.innerText?.trim() ?? '', wanted, MATCH_CONFIG)
      ) ?? null
    )
  }

  private async fillCombobox(answers: Answer[]): Promise<void> {
    const input = this.comboboxInputElement
    const combobox = this.comboboxElement
    if (!input || !combobox) {
      return
    }
    for (const storedAnswer of answers) {
      const wanted = this.wantedValue(storedAnswer)
      if (!wanted) {
        continue
      }
      // Focus + type to filter the option list (react-select commits the
      // search via the input's native onChange).
      input.focus()
      setNativeValue(input, wanted)
      await sleep(250)

      const listbox = await this.waitForListbox()
      if (!listbox) {
        continue
      }
      const options = getElements(listbox, `.//*[@role="option"]`)
      const match = this.findOption(options, wanted)
      if (match) {
        // react-select selects on mousedown; fire the full sequence so the
        // value commits regardless of which handler the version listens on.
        dispatchMouseSequence(match)
        await sleep(50)
        return
      }
    }
    // No match — blur to close the menu so we don't leave it hanging.
    input.blur()
  }

  async fill(): Promise<void> {
    await fieldFillerQueue.enqueue(async () => {
      const answers = await this.answer()
      if (answers.length === 0) {
        return
      }
      if (this.nativeSelectElement) {
        await this.fillNative(answers)
      } else if (this.comboboxElement) {
        await this.fillCombobox(answers)
      }
    })
  }
}
