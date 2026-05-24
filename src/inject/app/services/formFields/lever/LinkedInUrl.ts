import fieldFillerQueue from '@src/shared/utils/fieldFillerQueue'
import { getElement } from '@src/shared/utils/getElements'
import { LeverBaseInput } from './LeverBaseInput'
import { xpaths } from './xpaths'

/**
 * Dedicated adapter for Lever's `urls[LinkedIn]` input.
 *
 * Lever exposes a small fixed set of URL questions (`urls[LinkedIn]`,
 * `urls[GitHub]`, `urls[Portfolio]`, `urls[Twitter]`, `urls[Other]`).
 * LinkedIn gets its own class because it's the only one we treat as
 * a first-class identity field — the rest funnel through the generic
 * URL adapter below.
 */
export class LinkedInUrl extends LeverBaseInput<string> {
  static XPATH: string = xpaths.LINKEDIN_URL
  fieldType = 'TextInput'

  inputElement(): HTMLInputElement {
    return getElement(
      this.element,
      `.//input[@name="urls[LinkedIn]"]`
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

/**
 * Generic URL adapter for the rest of Lever's `urls[*]` inputs
 * (GitHub, Portfolio, Twitter, Other). Treated as a single field type
 * so the React widget can label them per `fieldName` (the visible
 * `<label>` text Lever renders next to each input).
 */
export class OtherUrl extends LeverBaseInput<string> {
  static XPATH: string = xpaths.OTHER_URL
  fieldType = 'TextInput'

  inputElement(): HTMLInputElement {
    return getElement(
      this.element,
      `.//input[starts-with(@name, "urls[")]`
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
