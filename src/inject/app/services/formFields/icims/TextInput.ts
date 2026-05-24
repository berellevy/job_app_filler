import fieldFillerQueue from '@src/shared/utils/fieldFillerQueue'
import { getElement } from '@src/shared/utils/getElements'
import { IcimsBaseInput } from './IcimsBaseInput'
import { xpaths } from './xpaths'

/**
 * Standard iCIMS text input — covers the basic candidate identity fields.
 *
 * Unlike Lever (one combined `name` input), iCIMS splits the candidate name
 * into discrete `applicant.firstname` / `applicant.lastname` inputs (classic)
 * or `firstname` / `lastname` (Talent Cloud), so each is registered as its
 * own adapter instance. The per-field input selector tolerates both naming
 * generations plus the `data-field-id` attribute.
 *
 * Sources: hemanth2416-byte/formpilot src/adapters/icims.js (the
 * `applicant.*` name map) and aarjunm04/AI_Job_Automation_Agent
 * ats_detector.py (`input[data-field-id='firstname'], input[name='firstname']`).
 */
abstract class IcimsTextInputBase extends IcimsBaseInput<string> {
  /** XPath fragment (relative to `this.element`) locating the bare input. */
  abstract inputXpath: string

  inputElement(): HTMLInputElement {
    return getElement(this.element, this.inputXpath) as HTMLInputElement
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

export class FirstNameInput extends IcimsTextInputBase {
  static XPATH: string = xpaths.FIRST_NAME
  fieldType = 'TextInput'
  inputXpath = [
    ".//input[@name='applicant.firstname'",
    " or @name='firstname'",
    " or @data-field-id='firstname']",
  ].join('')
}

export class LastNameInput extends IcimsTextInputBase {
  static XPATH: string = xpaths.LAST_NAME
  fieldType = 'TextInput'
  inputXpath = [
    ".//input[@name='applicant.lastname'",
    " or @name='lastname'",
    " or @data-field-id='lastname']",
  ].join('')
}

export class EmailInput extends IcimsTextInputBase {
  static XPATH: string = xpaths.EMAIL
  fieldType = 'TextInput'
  inputXpath = [
    ".//input[@name='applicant.email'",
    " or @name='applicant.emailaddress'",
    " or @name='email'",
    " or @data-field-id='email']",
  ].join('')
}
