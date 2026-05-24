import { getElement } from '@src/shared/utils/getElements'
import { Answer } from '@src/shared/utils/types'
import { AshbyBaseInput } from './AshbyBaseInput'
import { xpaths } from './xpaths'
import { setNativeValue } from './utils'

/**
 * Specialised text input for Ashby's LinkedIn URL field. It is a normal
 * `<input type="url">` (or sometimes `type="text"`), but we register it
 * as its own field type so the autofiller can target it by a stable
 * answer key across postings — Ashby exposes it as a SocialLink field
 * with `linkedin` in the path/name.
 */
export class LinkedInUrl extends AshbyBaseInput<string> {
  static XPATH: string = xpaths.LINKEDIN_URL
  fieldType: string = 'LinkedInUrl'

  get labelElement(): HTMLElement {
    return getElement(this.element, `.//label`)
  }

  get inputElement(): HTMLInputElement {
    return getElement(this.element, `.//input`) as HTMLInputElement
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
