import { getElement } from '@src/shared/utils/getElements'
import { Answer } from '@src/shared/utils/types'
import { AshbyBaseInput } from './AshbyBaseInput'
import { xpaths } from './xpaths'
import { setNativeValue } from './utils'

/**
 * Ashby phone field. Renders as `<input type="tel">` plus a country
 * selector dropdown (rendered as a sibling button + flag). We only
 * populate the number — the country code is left to the user, since
 * stored answers in the extension are free-text strings.
 */
export class Phone extends AshbyBaseInput<string> {
  static XPATH: string = xpaths.PHONE
  fieldType: string = 'PhoneInput'

  get labelElement(): HTMLElement {
    return getElement(this.element, `.//label`)
  }

  get inputElement(): HTMLInputElement {
    return getElement(this.element, `.//input[@type="tel"]`) as HTMLInputElement
  }

  listenForChanges(): void {
    this.inputElement?.addEventListener('input', () => {
      this.triggerReactUpdate()
    })
  }

  currentValue(): string {
    return this.inputElement?.value ?? ''
  }

  async fill(): Promise<void> {
    const answers: Answer[] = await this.answer()
    if (answers.length === 0) {
      return
    }
    const value = answers[0].answer as string
    setNativeValue(this.inputElement, value)
  }
}
