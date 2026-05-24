import fieldFillerQueue from '@src/shared/utils/fieldFillerQueue'
import { getElement } from '@src/shared/utils/getElements'
import { LeverBaseInput } from './LeverBaseInput'
import { xpaths } from './xpaths'

/**
 * Lever phone input. Functionally identical to a plain text input today,
 * but kept as its own class so phone-number normalisation (E.164 / country
 * code stripping) can be added in one place without touching the generic
 * text-input path.
 */
export class Phone extends LeverBaseInput<string> {
  static XPATH: string = xpaths.PHONE
  fieldType = 'TextInput'

  inputElement(): HTMLInputElement {
    return getElement(
      this.element,
      `.//input[@name="phone"]`
    ) as HTMLInputElement
  }

  listenForChanges(): void {
    this.inputElement()?.addEventListener('input', () => {
      this.triggerReactUpdate()
    })
  }

  currentValue(): string {
    return this.inputElement()?.value || ''
  }

  async fill(): Promise<void> {
    const answers = await this.answer()
    const input = this.inputElement()
    if (!input || answers.length === 0) {
      return
    }
    const firstAnswer = answers[0]
    await fieldFillerQueue.enqueue(async () => {
      input.value = firstAnswer.answer
      input.dispatchEvent(new InputEvent('input', { bubbles: true }))
      input.dispatchEvent(new Event('change', { bubbles: true }))
    })
  }
}
