import fieldFillerQueue from '@src/shared/utils/fieldFillerQueue'
import { getElement } from '@src/shared/utils/getElements'
import { IcimsBaseInput } from './IcimsBaseInput'
import { xpaths } from './xpaths'

/**
 * Dedicated adapter for iCIMS's LinkedIn URL input.
 *
 * iCIMS exposes LinkedIn either as `applicant.linkedin` /
 * `applicant.linkedinurl` (classic) or `data-field-id='linkedin'` (Talent
 * Cloud); some templates only label the field, so a `placeholder*='LinkedIn'`
 * fallback is included. Treated as a first-class identity field, mirroring the
 * Lever `urls[LinkedIn]` adapter.
 *
 * Sources: hemanth2416-byte/formpilot src/adapters/icims.js
 * (`applicant.linkedin` → `linkedin`); aarjunm04/AI_Job_Automation_Agent
 * ats_detector.py (`linkedin_selector =
 * "input[data-field-id='linkedin'], input[placeholder*='LinkedIn']"`).
 */
export class LinkedInUrl extends IcimsBaseInput<string> {
  static XPATH: string = xpaths.LINKEDIN_URL
  fieldType = 'TextInput'

  inputElement(): HTMLInputElement {
    return getElement(
      this.element,
      [
        ".//input[@name='applicant.linkedin'",
        " or @name='applicant.linkedinurl'",
        " or @data-field-id='linkedin'",
        " or contains(@placeholder, 'LinkedIn')",
        " or contains(@placeholder, 'linkedin')]",
      ].join('')
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
