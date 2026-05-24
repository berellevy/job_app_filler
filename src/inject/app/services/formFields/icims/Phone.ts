import fieldFillerQueue from '@src/shared/utils/fieldFillerQueue'
import { getElement } from '@src/shared/utils/getElements'
import { IcimsBaseInput } from './IcimsBaseInput'
import { xpaths } from './xpaths'

/**
 * iCIMS phone input. Functionally identical to a plain text input today, but
 * kept as its own class so phone-number normalisation (E.164 / country-code
 * stripping) can be added in one place without touching the generic
 * text-input path.
 *
 * iCIMS uses several phone `name` variants (`applicant.phone`,
 * `applicant.phonenumber`, `applicant.cellphone`) plus the Talent-Cloud
 * `phone` / `data-field-id='phone'`. The input selector covers all of them.
 * Source: hemanth2416-byte/formpilot src/adapters/icims.js (phone name map);
 * aarjunm04/AI_Job_Automation_Agent ats_detector.py (`phone_selector`).
 */
export class Phone extends IcimsBaseInput<string> {
  static XPATH: string = xpaths.PHONE
  fieldType = 'TextInput'

  inputElement(): HTMLInputElement {
    return getElement(
      this.element,
      [
        ".//input[@name='applicant.phone'",
        " or @name='applicant.phonenumber'",
        " or @name='applicant.cellphone'",
        " or @name='phone'",
        " or @data-field-id='phone']",
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
